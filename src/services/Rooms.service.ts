import { Logger } from '@overnightjs/logger';
import { injectable, singleton } from "tsyringe";
import { User, Err, Room, RoomUser, RoomResponse, RoomDetails, RoomDetailsAdv } from '../models';
import { SocketsHandler } from '../websocket/SocketsHandler';
import { RoomsDao } from '../data-access';
import { RedisClient } from '../util/RedisClient';


@injectable()
@singleton()
export class RoomsService {
	
	constructor(
		private roomDao:RoomsDao,  
		private ws:SocketsHandler, 
		private redis:RedisClient
	) {}

	public async createRoom(user:User, data) {

		let room = new Room();
		room.room_name = data.name;
		room.room_owner._id = user._id;
		room.room_owner.username = user.username;
		room.room_owner.user_image = user.user_image;
		room.room_options.privacy = data.privacy;
		room.online_users = 0;
		

		if (await this.roomDao.roomExist(room.room_name)) {
			throw new Err('Room already exists!');
		}

		let _room = await this.roomDao.save(room);
		Logger.Info('Room '+room.room_name+' created!');
		return _room;

	}

	public async joinRoom(user:User, room_name, sid) {

		try {

			let room = await this.roomDao.roomExist(room_name) as Room;

			if (!room) throw new Err('Room dosen\'t exist!');
			if (room.room_options.privacy == 'private' && !room.room_users.includes(user._id) && room.room_owner._id.toString() !== user._id.toString()) {
				throw new Error('Private room!');
			}
			if (room.room_banned.includes(user._id)) throw new Err('User is banned!', 401);

			await this.addUserToRoom(user, room, sid);
			
			this.ws.sendToRoom('INFO', user.username+' joined', room.room_name);

			this.sendOnlineUsers(room.room_name);

			Logger.Info(user.username+' joined '+room.room_name);

			if (room.room_owner._id.toString() == user._id.toString()) return new RoomDetailsAdv(room);
			return new RoomDetails(room);

		}catch(e) {
			console.log(e);
			throw new Err(e.error || 'Unable to join '+room_name);
		}

	}

	public async listRooms(user:User, type) {
		let rooms;
		switch (type) {
			case "owned":
				rooms  = await this.roomDao.getByAdminId(user._id) as Array<Room>;
				break;
			case "public":
				rooms  = await this.roomDao.getAll() as Array<Room>;
				break;
			default:
				rooms  = await this.roomDao.getByUserId(user._id) as Array<Room>;
				break;
		}

		let roomsResponses = rooms.map(room => new RoomResponse(room));
		return roomsResponses;
	}

	public async userDisconnected(sid, user:User) {

		let userSockets = await this.redis.getAllList('sockets-'+user._id);
		let rooms = await this.roomDao.getUserRooms(user);
		let dec = true;

		for (let i = 0; i < rooms.length; i++) {
			dec = await this.leaveRoom(userSockets, sid, user, rooms[i]);
		}

		if (dec) await this.roomDao.decreaseOnlineUsersCount(rooms);

	}

	public async leaveRoom(userSockets, sid, user:User, room) {

		if (userSockets.length > 1) {
			
			let multipleSockets = false;

			for (let x = 0; x < userSockets.length; x++) {
				if (await this.roomDao.socketInRoom(room, userSockets[x]) && userSockets !== sid) {
					multipleSockets = true;
					break;
				}
			}

			if (multipleSockets) {
				await this.roomDao.removeSocketFromRoom(room, sid);
				this.ws.removeSocketFromRoom(sid, room, user._id.toString());
				return false;
			}
		}

		await this.removeUserFromRoom(user, room, sid);
		await this.ws.sendToRoom('INFO', user.username+' left the room', room);
		return true;

	}

	public checkRoomAdmin(uid, room:Room):boolean {
		return room.room_owner == uid;
	}

	public async sendOnlineUsers(room_name) {
		let users = await this.roomDao.getOnlineUsers(room_name);
		this.ws.sendToRoom('USERS', users, room_name);
	}

	private async addUserToRoom(user:User, room:Room, sid) {
		
		let inc = !await this.roomDao.userInRoom(user, room);
		let roomUser = new RoomUser(user);

		roomUser.is_admin = user._id.toString() == room.room_owner._id.toString();
		roomUser.is_mod = room.room_mods.includes(user._id);

		await this.ws.addSocketToRoom(sid, room.room_name, user._id.toString());
		await this.roomDao.addUserToRoom(roomUser, room, sid, inc);

	}

	private async removeUserFromRoom(user:User, room, sid) {
		this.ws.removeSocketFromRoom(sid, room, user._id.toString());
		await this.roomDao.removeUserFromRoom(user, room, sid);
		this.sendOnlineUsers(room);
	}

}  