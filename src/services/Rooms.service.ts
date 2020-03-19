import { Logger } from '@overnightjs/logger';
import { injectable } from "tsyringe";
import { User, Err, Room, UserResponse } from '../models';
import { SocketsHandler } from '../websocket/SocketsHandler';
import { RoomsDao } from '../data-access';


@injectable()
export class RoomsService {
	
	constructor(private roomDao:RoomsDao, private ws:SocketsHandler) {}

	public createRoom(user:User, data) {
		
		let room = new Room();
		room.room_id = data.name;
		room.room_desc = data.desc || null;
		room.room_privacy = data.privacy;
		room.room_owner = user.user_id;

		return new Promise((resolve, reject) => {
			Promise.all([this.roomDao.roomExist(room.room_id), this.roomDao.saveRoom(room)])
				.then(data => {
					resolve(room);
				})
				.catch(reject);
		});

	}

	public joinRoom(user:UserResponse, room, sid) {

		return new Promise((resolve, reject) => {
			Promise.all([this.roomDao.checkRoom(room), this.checkRoomAdmin(user.user_id, room)])
				.then(data => {
					user.is_admin = data[1];
					this.ws.addSocketToRoom(sid, room, user.user_id).then(
						x => {
							this.ws.sendToRoom('test', user.username+' joined', room);
							resolve();
						}
					).catch(reject);
				})
				.catch(reject)
		});

	}

	public checkRoomAdmin(uid, room):Promise<boolean> {

		return new Promise((resolve, reject) => {
			this.roomDao.getRoomAdmin(room).then(id => {
				if (id.length == 0) {
					resolve(false);
				}else if (id[0].room_owner == uid) {
					resolve(true);
				}else {
					resolve(false);
				}

			}).catch(reject);
		});

	}

}  