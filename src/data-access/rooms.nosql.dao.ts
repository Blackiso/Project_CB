import mongoose from 'mongoose';
import { Schema, ObjectId, Model } from 'mongoose';
import { injectable, singleton } from "tsyringe";
import { User, Err, Room, RoomUser } from '../models';
import { Logger } from '@overnightjs/logger';
import { RedisClient } from '../util/RedisClient';


@injectable()
@singleton()
export class RoomsDao {

	private roomsSchema;
	private RoomModel;

	constructor(private redis:RedisClient) {
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

	public async getByName(name):Promise<Room> {
		return await this.RoomModel.findOne({ room_name: name }).collation( { locale: 'en', strength: 2 } );
	}

	public async getById(id):Promise<Room> {
		return await this.RoomModel.findOne({ _id: id });
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

	public async getUserRooms(user:User):Promise<Array<string>> {
		return await this.redis.getSet('rooms-'+user._id.toString());
	}

	public async socketInRoom(name, sid):Promise<boolean> {
		return await this.redis.checkSetValue('sockets-'+name, sid) == 1;
	}

	public async userInRoom(user:User, room:Room) {
		return await this.redis.checkSetValue('rooms-'+user._id.toString(), room.room_name) == 1;
	}

	public async removeSocketFromRoom(room, sid) {
		await this.redis.removeSet('sockets-'+room, sid);
	}

	public async getOnlineUsers(name):Promise<Array<any>> {
		let data = await this.redis.getHash('users-'+name);
		let users = [] as Array<object>;

		for (let key in data) {
			users.push(JSON.parse(data[key]));
		}
		return users;
	}

	public async addUserToRoom(roomUser:RoomUser, room:Model | Room, sid, inc?) {
		if (!room.room_users.includes(roomUser._id)) room.room_users.push(roomUser._id);
		if(inc) room.online_users++;

		await this.redis.addHashKey('users-'+room.room_name, roomUser._id.toString(), roomUser);
		await this.redis.addSet('sockets-'+room.room_name, sid);
		await this.redis.addSet('rooms-'+roomUser._id, room.room_name);
		await room.save();
	}

	public async removeUserFromRoom(user:User, room, sid) {
		await this.redis.deleteHasKey('users-'+room, user._id.toString());
		await this.redis.removeSet('rooms-'+user._id.toString(), room);
		await this.redis.removeSet('sockets-'+room, sid);
	}

	public async decreaseOnlineUsersCount(rooms_name:Array<string>) {
		await this.RoomModel.updateMany({ room_name: { $in: rooms_name } } ,  { $inc: { online_users: -1 } });
	}

	private getRoomModel() {
		return mongoose.model('Room', this.roomsSchema);
	}

}