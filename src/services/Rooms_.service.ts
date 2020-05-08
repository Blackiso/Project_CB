import { Logger } from '@overnightjs/logger';
import { injectable, singleton } from "tsyringe";
import { IUser, Err, IRoom, RoomUser } from '../models';
import { RoomsRepository, UsersRepository, MessagesRepository } from '../repositorys';
import { RoomsApi } from '../interfaces';
import { EventEmitter } from 'events';
import { RoomUsersService } from './RoomUsers.service';


@injectable()
@singleton()
export class RoomsService {

	private roomsEvents:EventEmitter = new EventEmitter();	

	constructor(
		private roomRep:RoomsRepository
	) {}


	public async createRoom(user:User, roomName, options) {
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

		Logger.Info('Room '+room.room_name+' created!');
		return await this.roomRep.save(room);
	}

	public async deleteRoom(user:User, room:Room) {

	}

}