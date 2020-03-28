import { Logger } from '@overnightjs/logger';
import { injectable } from "tsyringe";
import { User, Err, Room, UserResponse, RoomResponse, OwnedRoomResponse } from '../models';
import { SocketsHandler } from '../websocket/SocketsHandler';
import { RoomsDao, UsersDetailsDaoSql, UsersRoomsDao } from '../data-access';
import { RedisClient } from '../util/RedisClient';


@injectable()
export class RoomsService {
	
	constructor(
		private roomDao:RoomsDao, 
		private usersRoomsDao:UsersRoomsDao,  
		private ws:SocketsHandler, 
		private redis:RedisClient, 
		private usersDao:UsersDetailsDaoSql
	) {}

	public async createRoom(user:User, data) {

		let room = new Room();
		room.room_name = data.name;
		room.room_owner._id = user._id;
		room.room_owner.username = user.username;
		room.room_owner.user_image = user.user_image;
		room.room_options.privacy = data.privacy;
		

		if (await this.roomDao.roomExist(room.room_name)) {
			throw new Err('Room already exists!');
		}

		return await this.roomDao.save(room);

	}

	public async joinRoom(user:User, room_name, sid) {

		try {

			let room = await this.roomDao.roomExist(room_name) as Room;

			if(!room) throw new Err('Room dosen\'t exist!');
			if (room.room_options.privacy == 'private' && !room.room_users.includes(user._id) && room.room_owner._id.toString() !== user._id.toString()) {
				throw new Error();
			}
			if (room.room_banned.includes(user._id)) throw new Err('User is banned!', 401);

			await this.addUserToRoom(user, room, sid);
			this.ws.sendToRoom('INFO', user.username+' joined', room_name);

			this.sendOnlineUsers(room_name);

			if (room.room_owner._id.toString() == user._id.toString()) return new OwnedRoomResponse(room);
			return new RoomResponse(room);

		}catch(e) {
			throw new Err(e.error || 'Unable to join '+room_name);
		}

	}

	public checkRoomAdmin(uid, room:Room):boolean {
		return room.room_owner == uid;
	}

	public async sendOnlineUsers(room_name) {
		let users = await this.getRoomOnlineUsers(room_name);
		this.ws.sendToRoom('USERS', users, room_name);
	}

	public async getRoomOnlineUsers(room_name) {

		let data = await this.redis.getHash(room_name);
		let users = [] as Array<object>;

		for (let key in data) {
			users.push(JSON.parse(data[key]));
		}
		return users;

	}

	private async addUserToRoom(user:User, room:Room, sid) {
		let { _id, username, user_image } = user;
		await this.ws.addSocketToRoom(sid, room.room_name, user._id.toString());
		await this.redis.addHashKey(room.room_name, sid, { _id, username, user_image });
		await this.roomDao.addUserToRoom(user._id, room);
	}

}  