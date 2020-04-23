import { Logger } from '@overnightjs/logger';
import { injectable, singleton } from "tsyringe";
import { User, Err, Room, RoomUser } from '../models';
import { RoomsRepository, UsersRepository } from '../repositorys';
import { RoomsApi } from '../interfaces';
import { EventEmitter } from 'events';


@injectable()
@singleton()
export class RoomsService implements RoomsApi<User, Room> {

	private roomsEvents:EventEmitter = new EventEmitter();	

	constructor(
		private roomRep:RoomsRepository,  
		private usersRep:UsersRepository
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
			if (room.room_options.privacy == 'private' && !room.room_users.includes(user._id.toString()) && room.room_owner._id.toString() !== user._id.toString()) {
				throw new Error('Private room!');
			}
			if (room.room_banned.includes(user._id)) throw new Err('User is banned!', 401);

			await this.addUserToRoom(user, room, sid);

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

	public async modUser(user:User, userId:string, roomId:string) {
		let room = await this.roomRep.getById(roomId);
		let roomUsers = await this.getOnline(room.room_name);

		if (this.userCanModifyRoom(user, room) && room.room_users.includes(userId)) {
			let is_mod = room.room_mods.includes(userId);

			if (is_mod) {
				room.room_mods = room.room_mods.filter(id => id !== userId);
			}else {
				room.room_mods.push(userId);
			}

			let roomUser = roomUsers.find(u => u._id == userId) as RoomUser;
			roomUser.is_mod = !is_mod;

			await this.roomRep.update(room);
			if (roomUser !== null) await this.roomRep.addOnlineUser(roomUser, room.room_name);

			let msg = roomUser.is_mod ? roomUser.username+' is now a moderator' : roomUser.username+' is no longer a moderator';
			this.roomsEvents.emit('users_update', msg, room.room_name);
			this.roomsEvents.emit('room_update', room.room_name);

		}else {
			throw new Err('Can\'t mod user', 401);
		}
	}

	public async disconnect(user:User, sid) {

		let userSockets = await this.usersRep.getSockets(user._id.toString());
		let rooms = await this.roomRep.getUserRooms(user);
		let dec = true;

		for (let i = 0; i < rooms.length; i++) {
			dec = await this.leaveRoom(userSockets, sid, user, rooms[i]);
		}

		if (dec) await this.roomRep.decreaseOnlineUsersCount(rooms);

	}

	public async leave(user:User, roomName, sid) {
		let userSockets = await this.usersRep.getSockets(user._id.toString());
		if (await this.leaveRoom(userSockets, sid, user, roomName)) {
			await this.roomRep.decreaseOnlineUsersCount([roomName]);
		}
	}

	private async leaveRoom(userSockets, sid, user:User, roomName) {

		await this.roomRep.removeSocketFromRoom(roomName, sid);
		this.roomsEvents.emit('socket_left_room', sid, user._id.toString(), roomName);

		if (userSockets.length > 1) {

			for (let x = 0; x < userSockets.length; x++) {
				if (userSockets[x] !== sid) {
					if (await this.roomRep.socketInRoom(roomName, userSockets[x])) return false;
				}
			}

		}

		await this.roomRep.removeUserFromRoom(user, roomName, sid);
		this.roomsEvents.emit('users_update', user.username+' left the room', roomName);

		return true;

	}

	public async getOnline(roomName:string):Promise<Array<RoomUser>> {
		return await await this.roomRep.getOnlineUsers(roomName);
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

	private async addUserToRoom(user:User, room:Room, sid) {
		
		let inc = !await this.roomRep.userInRoom(user, room);
		let roomUser = new RoomUser(user);

		roomUser.is_admin = user._id.toString() == room.room_owner._id.toString();
		roomUser.is_mod = room.room_mods.includes(user._id);
		await this.roomRep.addUserToRoom(roomUser, room, sid, inc);

	}

	private userCanModifyRoom(user:User, room:Room) {
		return room.room_mods.includes(user._id.toString()) || user._id.toString() == room.room_owner._id.toString();
	}

}  