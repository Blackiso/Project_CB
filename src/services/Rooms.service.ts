import { Logger } from '@overnightjs/logger';
import { injectable } from "tsyringe";
import { User, Err, Room } from '../models';
import { Emitter } from '../websocket/emitters/Emitter';
import { RoomsDao } from '../data-access';


@injectable()
export class RoomsService {
	
	constructor(private roomDao:RoomsDao, private ws:Emitter) {}

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
				.catch(e => {
					reject(e);
				});
		});

	}

	joinRoom(user:User, roomName) {
		this.ws.addSocketToRoom(user, roomName);
	}

}  