import mongoose from 'mongoose';
import { Schema, ObjectId } from 'mongoose';
import { injectable } from "tsyringe";
import { User, Err, Room } from '../models';
import { Logger } from '@overnightjs/logger';


@injectable()
export class RoomsDao {

	private roomsSchema;
	private RoomModel;

	constructor() {
		this.roomsSchema = new Schema({
			room_name: String,
			room_owner: ObjectId,
			room_privacy: String,
			room_options: String,
			room_mods: [ObjectId],
			room_users: [ObjectId],
			room_banned: [ObjectId]
		});

		this.RoomModel = this.getRoomModel();
	}

	public async save(room:Room):Promise<Room> {
		let _room = new this.RoomModel({
			room_name: room.room_name,
			room_owner: room.room_owner,
			room_privacy: room.room_privacy,
			room_options: room.room_options
		});

		return await _room.save();
	}

	public async getByName(name):Promise<Room | null> {
		return null;
	}

	public async roomExist(name):Promise<boolean | Room> {
		let room = await this.RoomModel.findOne({ room_name: name });
		if (!room) return false;
		return room;
	}

	public async getRoomAdmin(room):Promise<string | null> {
		return null;
	}

	public async listRoomUsers(room):Promise<Array<string> | null> {
		return null;
	}

	private getRoomModel() {
		return mongoose.model('Room', this.roomsSchema);
	}

}