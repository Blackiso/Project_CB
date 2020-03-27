import { Logger } from '@overnightjs/logger';
import { injectable } from "tsyringe";
import { User, Err, Room, UserResponse, RoomResponse } from '../models';
import { SocketsHandler } from '../websocket/SocketsHandler';
import { RoomsDao, UsersDetailsDaoSql, UsersRoomsDao } from '../data-access';
import { RedisClient } from '../util/RedisClient';
import { ModelMapper } from '../util';


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
		room.room_privacy = data.privacy;
		room.room_options = "option";
		room.room_owner = user._id.toString();

		if (await this.roomDao.roomExist(room.room_name)) {
			throw new Err('Room already exists!');
		}

		return await this.roomDao.save(room);

	}

	public async joinRoom(user:User, name, sid) {

		try {

			let room = await this.roomDao.roomExist(name) as Room;
			if(!room) throw new Err('Room dosen\'t exists!');

			await this.ws.addSocketToRoom(sid, name, user._id.toString());
			this.addUserToRoom(user._id, room);

			/// adding room to list of joined rooms for this socket
			await this.redis.addStringToList(sid, name);
			//////////////////////////////////////////////////////

			let { _id, username, user_image } = user;
			await this.redis.addHashKey(name, sid, { _id, username, user_image });

			this.ws.sendToRoom('INFO', user.username+' joined', name);

			let users = await this.getRoomOnlineUsers(name);
			this.ws.sendToRoom('USERS', users, name);

		}catch(e) {
			throw new Err(e.error || 'Unable to join '+name);
		}

	}

	public async getRoomDetails(room) {

	}

	public async addUserToRoom(_id, room:Room | any) {
		if (room.room_banned.includes(_id)) throw new Err('User is banned!', 401);
		
		if (!room.room_users.includes(_id)) {
			room.room_users.push(_id);
		}
		await room.save();
	}

	public checkRoomAdmin(uid, room:Room):boolean {
		return room.room_owner == uid;
	}

	public async getRoomAdmin(room) {
		let adminId = await this.roomDao.getRoomAdmin(room);
		let { _id, username } = await this.usersDao.getUserById(adminId) as User;
		return { _id, username };		
	}

	public async getRoomOnlineUsers(room_name) {

		let data = await this.redis.getHash(room_name);
		let users = [] as Array<object>;

		for (let key in data) {
			users.push(JSON.parse(data[key]));
		}
		return users;

	}

	public removeUserFromRoom(sid, user:User) {
		this.redis.getAllList(sid)
			.then(rooms => {
				if (rooms !== null) {
					rooms.forEach(r => {
						this.ws.sendToRoom('INFO', user.username+' left', r);
						this.redis.deleteHasKey(r, sid);
					});
					this.redis.deleteList(sid).then(Logger.Info).catch(Logger.Err);
				}
			}).catch(Logger.Err);
	}

	public async getJoinedRooms(_id) {
		let rooms = await this.roomDao.listUserRooms(_id) as Array<Room>;
		let users = [] as Array<number>;

		rooms.forEach(r => {
			if (!users.includes(r.room_owner)) {
				users.push(r.room_owner);
			}
		});

		let admins = await this.usersDao.getUsersById(users);
		admins.forEach(admin => {
			for (let i = 0; i < rooms.length; i++) {
				if (admin._id == rooms[i].room_owner) {
					rooms[i].room_owner = admin;
				}
			}
		});

		return rooms;
	}

}  