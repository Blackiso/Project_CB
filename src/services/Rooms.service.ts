import { Logger } from '@overnightjs/logger';
import { injectable, singleton } from "tsyringe";
import { User, Err, Room, RoomUser } from '../models';
import { RoomsRepository, UsersRepository, MessagesRepository } from '../repositorys';
import { RoomsApi } from '../interfaces';
import { EventEmitter } from 'events';
import { RoomUsersService } from './RoomUsers.service';


@injectable()
@singleton()
export class RoomsService implements RoomsApi<User, Room> {

	private roomsEvents:EventEmitter = new EventEmitter();	

	constructor(
		private roomUsersService:RoomUsersService,
		private roomRep:RoomsRepository,  
		private usersRep:UsersRepository,
		private msgRep:MessagesRepository
	) {}

	public get events() {
		return this.roomsEvents;
	}

	public async create(user:User, roomName, options, sid):Promise<Room> {

		let room = new Room();
		room.room_name = roomName;
		room.room_owner._id = user._id;
		room.room_owner.username = user.username;
		room.room_owner.user_image = user.user_image;
		room.room_options.privacy = options.privacy;
		room.online_users = 0;

		if (await this.roomRep.getByName(room.room_name)) {
			throw new Err('Room already exists!');
		}

		let _room = await this.roomRep.save(room);
		Logger.Info('Room '+room.room_name+' created!');
		await this.join(user, _room, sid);
		return _room;

	}

	public async join(user:User, room:any, sid):Promise<Room> {

		try {

			if (!room._id) room = await this.roomRep.getByName(room);
			if (!room) throw new Err('Room dosen\'t exist!');
			if (room.room_options.privacy == 'private' && !room.room_users.includes(user._id.toString()) 
				&& room.room_owner._id.toString() !== user._id.toString()) {
				throw new Error('Private room!');
			}
			if (room.room_banned.includes(user._id)) throw new Err('User is banned!', 401);

			await this.roomUsersService.addUserToRoom(user, room, sid);

			this.roomsEvents.emit('socket_joined_room', sid, user._id.toString(), room.room_name);
			this.roomsEvents.emit('users_update', user.username+' joined the room', room.room_name);

			Logger.Info(user.username+' joined '+room.room_name);

			return room;

		}catch(e) {
			console.log(e);
			throw new Err(e.error || 'Unable to join '+(room.room_name || room));
		}

	}

	public async list(user:User, type:string):Promise<Array<Room>> {
		let rooms;
		switch (type) {
			case "owned":
				rooms  = await this.roomRep.getByAdminId(user._id) as Array<Room>;
				break;
			case "public":
				rooms  = await this.roomRep.getAll() as Array<Room>;
				break;
			default:
				rooms  = await this.roomRep.getByUserId(user._id) as Array<Room>;
				break;
		}

		return rooms;
	}

	public async roomModerator(user:User, userId:string, roomId:string) {
		let room = await this.roomRep.getById(roomId);

		if (this.roomUsersService.is_ableToModifyRoom(user, room) && room.room_users.includes(userId)) {

			let roomUser = await this.roomUsersService.makeUserModerator(userId, room);

			let msg = roomUser.is_mod ? roomUser.username+' is now a moderator' : roomUser.username+' is no longer a moderator';
			this.roomsEvents.emit('users_update', msg, room.room_name);
			this.roomsEvents.emit('room_update', room.room_name);

		}else {
			throw new Err('Can\'t mod user', 401);
		}
	}

	public async banUserFromRoom(user:User, userId:string, roomId:string) {
		let room = await this.roomRep.getById(roomId);
		let userToBan = await this.usersRep.getById(userId);

		if (this.roomUsersService.is_ableToModifyRoom(user, room) && 
			room.room_users.includes(userId) && 
			room.room_owner._id.toString() !== userId) {
			
			if (await this.roomUsersService.banUserFromRoom(userToBan, room)) {

				let sockets = await this.usersRep.getSockets(userToBan._id.toString());
				for (let i = 0; i < sockets.length; i++) {
					if (await this.roomRep.socketInRoom(room.room_name, sockets[i])) {
						this.roomsEvents.emit('socket_left_room', sockets[i], userToBan._id.toString(), room.room_name);
					}
				}

				this.roomsEvents.emit('users_update', userToBan.username+' hase been banned!', room.room_name);
				this.roomsEvents.emit('user_ban', userToBan, room);
			}else {
				this.roomsEvents.emit('users_update', null, room.room_name);
			}
			
		}else {
			throw new Err('Can\'t ban user', 401);
		}
	}

	public async disconnect(user:User, sid) {
		let rooms = await this.roomRep.getBySocket(user, sid);
		let roomsNames = [] as Array<string>;

		for (let i = 0; i < rooms.length; i++) {
			if (await this.roomUsersService.removeUserFromRoom(user, rooms[i], sid)) {
				this.roomsEvents.emit('users_update', user.username+' left the room', rooms[i].room_name);
				roomsNames.push(rooms[i].room_name);
			}
			this.roomsEvents.emit('socket_left_room', sid, user._id.toString(), rooms[i].room_name);
		}
		user.online = false;
		this.usersRep.update(user);
		await this.roomRep.decreaseOnlineUsersCount(roomsNames);
	}

	public async leave(user:User, roomName, sid) {
		if (await this.roomUsersService.removeUserFromRoom(user, roomName, sid)) {
			this.roomsEvents.emit('users_update', user.username+' left the room', roomName);
		}
		this.roomsEvents.emit('socket_left_room', sid, user._id.toString(), roomName);
		await this.roomRep.decreaseOnlineUsersCount([roomName]);
	}

	public async getRoom(user:User, roomId:string):Promise<Room> {
		let room = await this.roomRep.getById(roomId);
		if (room == null) throw new Err('Room not found!');
		if (room.room_users.includes(user._id.toString())) {
			return room;
		}else {
			throw new Err('Error retrieving room', 401);
		}
	}

	// public async getOnline(user:User, roomName:string):Promise<Array<RoomUser>> {
	// 	return (await this.roomRep.getOnlineUsers(roomName)).map(u => {
	// 		u.is_friend = user.user_friends.includes(u._id.toString());
	// 		return u;
	// 	});
	// }

	public async getOnline(roomName) {
		return await this.roomRep.getOnlineUsers(roomName);
	}

	public async getBanned(user:User, roomId):Promise<RoomUser[]> {
		let room =  await this.getRoom(user, roomId);

		if (this.roomUsersService.is_ableToModifyRoom(user, room)) {
			return await this.roomUsersService.getRoomUsers(user, room.room_banned);
		}else {
			throw new Err('Can\'t get users', 401);
		}

	} 

	public async updateOptions(user:User, roomId:string, options:any) {
		let room = await this.getRoom(user, roomId);
		if (this.roomUsersService.is_ableToModifyRoom(user, room)) {
			for (let option in room.room_options) {
				if (typeof options[option] !== 'undefined') {
					room.room_options[option] = options[option];
				}
			}

			await this.roomRep.update(room);
			this.roomsEvents.emit('room_update', room.room_name);
		}else {
			throw new Err('Can\'t update room', 401);
		}
	}

	public async deleteRoom(user:User, roomId:string) {
		let room = await this.getRoom(user, roomId);
		if (room.room_owner._id.toString() == user._id.toString()) {
			await this.roomRep.delete(room);
			await this.roomRep.deleteOnlineUsers(room.room_name);
			await this.msgRep.deleteAllMessageIds(room.room_name);
			Logger.Info('Delete room '+ room.room_name);
			this.roomsEvents.emit('room_deleted', room.room_name);
		}else {
			throw new Err('Can\'t delete room', 401);
		}
	}

}  