import { Logger } from '@overnightjs/logger';
import { injectable } from "tsyringe";
import { User, Err, Room, UserResponse, RoomResponse } from '../models';
import { SocketsHandler } from '../websocket/SocketsHandler';
import { RoomsDao, UsersDetailsDao, UsersRoomsDao } from '../data-access';
import { RedisClient } from '../util/RedisClient';
import { ModelMapper } from '../util';



@injectable()
export class RoomsService {
	
	constructor(
		private roomDao:RoomsDao, 
		private usersRoomsDao:UsersRoomsDao,  
		private ws:SocketsHandler, 
		private redis:RedisClient, 
		private usersDao:UsersDetailsDao
	) {}

	public async createRoom(user:User, data) {

		try {

			let room = new Room();
			room.room_id = data.name;
			room.room_desc = data.desc || null;
			room.room_privacy = data.privacy;
			room.room_owner = user.user_id;

			await this.roomDao.roomExist(room.room_id);
			await this.roomDao.saveRoom(room);
			await this.addRoomToUser(user.user_id, room.room_id);

			return room;

		}catch(e) {
			throw new Err(e.error || 'Unable to create '+data.name);
		}

	}

	public async joinRoom(user:UserResponse, room, sid) {

		try {

			await this.roomDao.checkRoom(room);
			await this.ws.addSocketToRoom(sid, room, user.user_id);
			await this.addRoomToUser(user.user_id, room);

			/// adding room to list of joined rooms for this socket
			await this.redis.addStringToList(sid, room);
			//////////////////////////////////////////////////////

			let is_admin = await this.checkRoomAdmin(user.user_id, room);
			user.is_admin = is_admin;
			await this.redis.addHashKey(room, sid, user);

			this.ws.sendToRoom('INFO', user.username+' joined', room);

			let users = await this.getRoomOnlineUsers(room);
			this.ws.sendToRoom('USERS', users, room);

		}catch(e) {
			throw new Err(e.error || 'Unable to join '+room);
		}

	}

	public async getRoomDetails(room) {

		let r = await this.roomDao.getById(room) as Room;
		let user = await this.getRoomAdmin(room);
		let roomResponse = new RoomResponse();

		roomResponse.room_owner = user;
		roomResponse.room_id = r.room_id;
		roomResponse.room_privacy = r.room_privacy;
		roomResponse.room_desc = r.room_desc;
		roomResponse.room_mods = [];
		return roomResponse;

	}

	public async addRoomToUser(user_id, room) {
		if (!(await this.usersRoomsDao.check(user_id, room))) {
			await this.usersRoomsDao.save(user_id, room);
		}
	}

	public async checkRoomAdmin(uid, room):Promise<boolean> {
		let id = await this.roomDao.getRoomAdmin(room);
		return id == uid;
	}

	public async getRoomAdmin(room) {
		let adminId = await this.roomDao.getRoomAdmin(room);
		let { user_id, username } = await this.usersDao.getUserById(adminId) as User;
		return { user_id, username };		
	}

	public async getRoomOnlineUsers(room) {

		let data = await this.redis.getHash(room);
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

	public async getJoinedRooms(user_id) {
		let rooms = await this.roomDao.listUserRooms(user_id) as Array<Room>;
		let users = [] as Array<number>;

		rooms.forEach(r => {
			if (!users.includes(r.room_owner)) {
				users.push(r.room_owner);
			}
		});

		let admins = await this.usersDao.getUsersById(users);
		admins.forEach(admin => {
			for (let i = 0; i < rooms.length; i++) {
				if (admin.user_id == rooms[i].room_owner) {
					rooms[i].room_owner = admin;
				}
			}
		});

		return rooms;
	}

}  