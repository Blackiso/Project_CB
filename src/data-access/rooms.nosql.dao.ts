import mongoose from 'mongoose';
import { Schema, ObjectId, Model } from 'mongoose';
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
			room_owner: {
				_id: ObjectId,
				username: String,
				user_image: String
			},
			room_options: {
				privacy: String,
				language_filter: Boolean,
				allow_invites: Boolean
			},
			room_mods: [ObjectId],
			room_users: [ObjectId],
			room_banned: [ObjectId],
			invited_users: [
				{
					_id: [ObjectId],
					username: String,
					invited_by: String
				}
			],
			online_users: Number
		});
		this.roomsSchema.index({ room_name: 1 }, { collation: { locale: 'en', strength: 2 } });
		this.RoomModel = this.getRoomModel();
	}

	public async save(room:Room):Promise<Room> {
		let _room = new this.RoomModel({
			room_name: room.room_name,
			room_owner: room.room_owner,
			room_options: room.room_options,
			online_users: room.online_users
		});

		return await _room.save();
	}

	public async getByName(name):Promise<Room | null> {
		return null;
	}

	public async getByUserId(id):Promise<Array<Room>> {
		return this.RoomModel.find({ room_users: id }).sort({ online_users: -1 }).limit(10);
	}

	public async getByAdminId(id):Promise<Array<Room>> {
		return this.RoomModel.find({ 'room_owner._id': id }).sort({ online_users: -1 }).limit(10);
	}

	public async getAll():Promise<Array<Room>> {
		return this.RoomModel.find({ 'room_options.privacy': 'public' }).sort({ online_users: -1 }).limit(10);
	}

	public async roomExist(name):Promise<boolean | Room> {
		let room = await this.RoomModel.findOne({ room_name: name }).collation( { locale: 'en', strength: 2 } );
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

	public async addUserToRoom(_id, room:Model | Room, inc?) {
		if (!room.room_users.includes(_id)) {
			room.room_users.push(_id);
		}
		if(inc) room.online_users++;
		await room.save();
	}

	public async decreaseOnlineUsersCount(rooms_name:Array<string>) {
		await this.RoomModel.updateMany({ room_name: { $in: rooms_name } } ,  { $inc: { online_users: -1 } });
	}

}