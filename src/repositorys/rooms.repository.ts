import mongoose from 'mongoose';
import { Schema, ObjectId, Model } from 'mongoose';
import { injectable, singleton } from "tsyringe";
import { User, Err, Room, RoomUser } from '../models';
import { Logger } from '@overnightjs/logger';
import { RedisClient } from '../lib';


@injectable()
@singleton()
export class RoomsRepository {

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
			room_mods: [String],
			room_users: [String],
			room_banned: [String],
			invited_users: [
				{
					_id: [String],
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

	public async getByName(name:string):Promise<Room> {
		return await this.RoomModel.findOne({ room_name: name }).collation( { locale: 'en', strength: 2 } );
	}

	public async getByNames(names:Array<string>):Promise<Array<Room>> {
		return await this.RoomModel.find({ room_name: { $in: names } }).collation( { locale: 'en', strength: 2 } );
	}

	public async getById(id:string):Promise<Room> {
		return await this.RoomModel.findOne({ _id: id });
	}

	public async getByUserId(id:string):Promise<Array<Room>> {
		return this.RoomModel.find({ room_users: id }).sort({ online_users: -1 }).limit(10);
	}

	public async getByAdminId(id:string):Promise<Array<Room>> {
		return this.RoomModel.find({ 'room_owner._id': id }).sort({ online_users: -1 }).limit(10);
	}

	public async getAll():Promise<Array<Room>> {
		return this.RoomModel.find({ 'room_options.privacy': 'public' }).sort({ online_users: -1 }).limit(10);
	}

	public async getBySocket(user:User, sid:string):Promise<Array<Room>> {
		let rooms = await this.getUserRooms(user);
		let names = [] as Array<string>;
		for (let i = 0; i < rooms.length; i++) {
			if (await this.socketInRoom(rooms[i], sid)) {
				names.push(rooms[i]);
			}
		}
		return this.getByNames(names);
	}

	public async getUserRooms(user:User):Promise<Array<string>> {
		return await this.redis.getSet('rooms-'+user._id.toString());
	}

	public async socketInRoom(name:string, sid:string):Promise<boolean> {
		return await this.redis.checkSetValue('sockets-'+name, sid) == 1;
	}

	public async userInRoom(user:User, room:Room):Promise<boolean> {
		return await this.redis.checkSetValue('rooms-'+user._id.toString(), room.room_name) == 1;
	}

	public async update(room:Model):Promise<Room> {
		return await room.save();
	}

	public async delete(room:Room) {
		return this.RoomModel.findByIdAndDelete(room._id);
	}

	public async removeSocketFromRoom(roomName:string, sid:string) {
		await this.redis.removeSet('sockets-'+roomName, sid);
	}

	public async getOnlineUsers(name:string):Promise<Array<RoomUser>> {
		let data = await this.redis.getHash('users-'+name);
		let users = [] as Array<RoomUser>;

		for (let key in data) {
			users.push(JSON.parse(data[key]));
		}
		return users;
	}

	public async addUserToRoom(roomUser:RoomUser, room:Model | Room, sid:string, inc?) {
		if (!room.room_users.includes(roomUser._id)) room.room_users.push(roomUser._id);
		if(inc) room.online_users++;

		await this.addOnlineUser(roomUser, room.room_name);
		await this.redis.addSet('sockets-'+room.room_name, sid);
		await this.redis.addSet('rooms-'+roomUser._id, room.room_name);
		await this.update(room);
	}

	public async addOnlineUser(roomUser:RoomUser, roomName:string) {
		return await this.redis.addHashKey('users-'+roomName, roomUser._id.toString(), roomUser);
	}

	public async deleteOnlineUsers(roomName:string) {
		return await this.redis.deleteHash('users-'+roomName);
	}

	public async removeUserFromRoom(user:User, roomName:string) {
		await this.redis.deleteHashKey('users-'+roomName, user._id.toString());
		await this.redis.removeSet('rooms-'+user._id.toString(), roomName);
	}

	public async decreaseOnlineUsersCount(roomsName:Array<string>) {
		await this.RoomModel.updateMany({ room_name: { $in: roomsName } } ,  { $inc: { online_users: -1 } });
	}

	private getRoomModel() {
		return mongoose.model('Room', this.roomsSchema);
	}

}