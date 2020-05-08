import mongoose from 'mongoose';
import { Schema, ObjectId, Model } from 'mongoose';
import { injectable, singleton } from "tsyringe";
import { IUser, Err, IRoom, RoomUser } from '../models';
import Room from '../models/persistence/Room';
import { Logger } from '@overnightjs/logger';
import { RedisClient } from '../lib';


@injectable()
@singleton()
export class RoomsRepository {

	private RoomModel;

	constructor(private redis:RedisClient) {
		this.RoomModel = Room;
	}

	public async save(room:IRoom):Promise<IRoom> {
		let _room = new this.RoomModel({
			room_name: room.room_name,
			room_owner: room.room_owner,
			room_options: room.room_options,
			online_users: room.online_users
		});

		return await _room.save();
	}

	public async getByName(name:string):Promise<IRoom> {
		return await this.RoomModel.findOne({ room_name: name }).collation( { locale: 'en', strength: 2 } );
	}

	public async getByNames(names:Array<string>):Promise<Array<IRoom>> {
		return await this.RoomModel.find({ room_name: { $in: names } }).collation( { locale: 'en', strength: 2 } );
	}

	public async getById(id:string):Promise<IRoom> {
		return await this.RoomModel.findOne({ _id: id });
	}

	public async getByUserId(id:string):Promise<Array<IRoom>> {
		return this.RoomModel.find({ room_users: id }).sort({ online_users: -1 }).limit(10);
	}

	public async getByAdminId(id:string):Promise<Array<IRoom>> {
		return this.RoomModel.find({ 'room_owner._id': id }).sort({ online_users: -1 }).limit(10);
	}

	public async getAll():Promise<Array<IRoom>> {
		return this.RoomModel.find({ 'room_options.privacy': 'public' }).sort({ online_users: -1 }).limit(10);
	}

	public async getBySocket(user:IUser, sid:string):Promise<Array<IRoom>> {
		let rooms = await this.getUserRooms(user);
		let names = [] as Array<string>;
		for (let i = 0; i < rooms.length; i++) {
			if (await this.socketInRoom(rooms[i], sid)) {
				names.push(rooms[i]);
			}
		}
		return this.getByNames(names);
	}

	public async getUserRooms(user:IUser):Promise<Array<string>> {
		return await this.redis.getSet('rooms-'+user._id.toString());
	}

	public async socketInRoom(name:string, sid:string):Promise<boolean> {
		return await this.redis.checkSetValue('sockets-'+name, sid) == 1;
	}

	public async userInRoom(user:IUser, room:IRoom):Promise<boolean> {
		return await this.redis.checkSetValue('rooms-'+user._id.toString(), room.room_name) == 1;
	}

	public async update(room:Model):Promise<IRoom> {
		return await room.save();
	}

	public async delete(room:IRoom) {
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

	public async addUserToRoom(roomUser:RoomUser, room:Model | IRoom, sid:string, inc?) {
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

	public async removeUserFromRoom(user:IUser, roomName:string) {
		await this.redis.deleteHashKey('users-'+roomName, user._id.toString());
		await this.redis.removeSet('rooms-'+user._id.toString(), roomName);
	}

	public async decreaseOnlineUsersCount(roomsName:Array<string>) {
		await this.RoomModel.updateMany({ room_name: { $in: roomsName } } ,  { $inc: { online_users: -1 } });
	}

}