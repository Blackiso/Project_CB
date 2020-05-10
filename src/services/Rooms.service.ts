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

	public get events() {
		return this.roomsEvents;
	}

	public async createRoom(user:IUser, roomName, options) {

		let room = {} as IRoom;
		room.room_owner = {};
		room.room_options = {};

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

	public async deleteRoom(user:IUser, room:IRoom) {
		if (user.is_admin(room)) {

			await this.roomRep.delete(room);
			await this.roomRep.deleteOnlineUsers(room.room_name);

			this.roomsEvents.emit('room_deleted', room.room_name);
		}else {
			throw new Err('Can\'t delete room', 401);
		}
	}

	public async getOwnedRooms(user:IUser):Promise<Array<Room>> {
		return await this.roomRep.getByAdminId(user._id);
	}

	public async getPublicRooms():Promise<Array<Room>> {
		return await this.roomRep.getAll();
	}

	public async getJoinedRooms(user:IUser):Promise<Array<Room>> {
		return await this.roomRep.getByUserId(user._id.toString());
	}

	public async getRoom(user:IUser, roomIdentifyer:string, type:string = 'id'):Promise<IRoom> {
		let room;
		switch (type) {
			case 'id':
				room = await this.roomRep.getById(roomIdentifyer);
				break;
			case 'name':
				room = await this.roomRep.getByName(roomIdentifyer);
				break;
		}

		if (room == null) throw new Err('Room not found!');
		if (user.is_admin(room) || user.in_room(room)) {
			return room;
		}else {
			throw new Err('Error retrieving room', 401);
		}
	}

}