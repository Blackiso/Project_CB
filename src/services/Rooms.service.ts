import { Logger } from '@overnightjs/logger';
import { injectable, singleton } from "tsyringe";
import { User, Err, Room, UserResponse, RoomResponse, OwnedRoomResponse } from '../models';
import { SocketsHandler } from '../websocket/SocketsHandler';
import { RoomsDao } from '../data-access';
import { RedisClient } from '../util/RedisClient';


@injectable()
@singleton()
export class RoomsService {
	
	constructor(
		private roomDao:RoomsDao,  
		private ws:SocketsHandler, 
		private redis:RedisClient,
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

			if(!room) throw new Err('Room dosen\'t exist!');
			if (room.room_options.privacy == 'private' && !room.room_users.includes(user._id) && room.room_owner._id.toString() !== user._id.toString()) {
				throw new Error();
			}
			if (room.room_banned.includes(user._id)) throw new Err('User is banned!', 401);

			await this.addUserToRoom(user, room, sid);
			await this.addRoomToUser(user, room);
			
			this.ws.sendToRoom('INFO', user.username+' joined', room_name);

			this.sendOnlineUsers(room_name);

			if (room.room_owner._id.toString() == user._id.toString()) return new OwnedRoomResponse(room);
			return new RoomResponse(room);

		}catch(e) {
			console.log(e);
			throw new Err(e.error || 'Unable to join '+room_name);
		}

	}

	public async userDisconnected(sid, user:User) {

		let userSockets = await this.redis.getAllList('sockets-'+user._id);
		let rooms = await this.redis.getSet('rooms-'+user._id);

		for (let i = 0; i < rooms.length; i++) {
			await this.leaveRoom(userSockets, sid, user, rooms[i]);
		}

	}

	public async leaveRoom(userSockets, sid, user:User, room) {

		if (userSockets.length > 1) {
			
			let is_other = false;

			for (let x = 0; x < userSockets.length; x++) {
				if (await this.redis.checkSetValue('sockets-'+room, userSockets[x]) == 1 && userSockets !== sid) {
					is_other = true;
				}
			}

			if (is_other) {
				await this.redis.removeSet('sockets-'+room, sid);
				// await this.ws.removeSocketFromRoom(sid, room, user._id.toString());
				return;
			}
		}

		await this.removeUserFromRoom(user, room, sid);
		await this.ws.sendToRoom('INFO', user.username+' left the room', room);
		await this.removeRoomFromUser(user, room);

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
		let inc = !(await this.redis.checkSetValue('rooms-'+user._id.toString(), room.room_name) == 1);
		let { _id, username, user_image } = user;
		await this.ws.addSocketToRoom(sid, room.room_name, user._id.toString());
		await this.redis.addHashKey('users-'+room.room_name, user._id.toString(), { _id, username, user_image });
		await this.redis.addSet('sockets-'+room.room_name, sid);
		await this.roomDao.addUserToRoom(user._id, room, inc);
	}

	private async removeUserFromRoom(user:User, room, sid) {
		// await this.ws.removeSocketFromRoom(sid, room, user._id.toString());
		await this.redis.deleteHasKey('users-'+room, user._id.toString());
		await this.redis.removeSet('sockets-'+room, sid);
		await this.roomDao.decreaseOnlineUsersCount([room]);
	}

	private async addRoomToUser(user:User, room:Room) {
		await this.redis.addSet('rooms-'+user._id, room.room_name);
	}

	private async removeRoomFromUser(user:User, room) {
		await this.redis.removeSet('rooms-'+user._id, room);
	}

}  