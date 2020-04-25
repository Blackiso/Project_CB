import { Logger } from '@overnightjs/logger';
import { injectable, singleton } from "tsyringe";
import { User, Err, Room, RoomUser } from '../models';
import { RoomsRepository, UsersRepository } from '../repositorys';
import { EventEmitter } from 'events';


@injectable()
@singleton()
export class RoomUsersService {
	
	constructor(
		private roomRep:RoomsRepository,  
		private usersRep:UsersRepository
	) {}

	public async addUserToRoom(user:User, room:Room, sid:string) {
		let inc = !await this.is_inRoom(user, room);
		let roomUser = new RoomUser(user);

		roomUser.is_admin = user._id.toString() == room.room_owner._id.toString();
		roomUser.is_mod = room.room_mods.includes(user._id);
		await this.roomRep.addUserToRoom(roomUser, room, sid, inc);
	}

	public async banUserFromRoom(user:User, room:Room):Promise<boolean> {
		if (!room.room_banned.includes(user._id.toString())) {
			room.room_banned.push(user._id.toString());
			await this.roomRep.update(room);
			await this.roomRep.removeUserFromRoom(user, room.room_name);
			return true;
		}else {
			room.room_banned = room.room_banned.filter(id => id !== user._id.toString());
			await this.roomRep.update(room);
			return false;
		}
	}

	public async makeUserModerator(userId:string, room:Room):Promise<RoomUser> {
		let is_mod = room.room_mods.includes(userId);
		let roomUsers = await this.roomRep.getOnlineUsers(room.room_name);

		if (is_mod) {
			room.room_mods = room.room_mods.filter(id => id !== userId);
		}else {
			room.room_mods.push(userId);
		}

		let roomUser = roomUsers.find(u => u._id == userId) as RoomUser;
		roomUser.is_mod = !is_mod;

		await this.roomRep.update(room);
		if (roomUser !== null) await this.roomRep.addOnlineUser(roomUser, room.room_name);
		return roomUser;
	}

	public async removeUserFromRoom(user:User, room:Room, sid:string):Promise<boolean> {
		await this.roomRep.removeSocketFromRoom(room.room_name, sid);
		if (!(await this.is_userUsingMultipleSockets(user, room, sid))) {
			await this.roomRep.removeUserFromRoom(user, room.room_name);
			return true;
		}
		return false;
	}

	public async getRoomUsers(usersIds:string[]) {
		let users = await this.usersRep.getByIds(usersIds);
		return users.map(user => new RoomUser(user));
	}

	public is_ableToModifyRoom(user:User, room:Room):boolean {
		return room.room_mods.includes(user._id.toString()) || user._id.toString() == room.room_owner._id.toString();
	}

	public async is_inRoom(user:User, room:Room):Promise<boolean> {
		return await this.roomRep.userInRoom(user, room);
	}

	public async is_userUsingMultipleSockets(user:User, room:Room, sid:string):Promise<boolean> {
		let userSockets = await this.usersRep.getSockets(user._id.toString());
		if (userSockets.length > 1) {
			for (let x = 0; x < userSockets.length; x++) {
				if (userSockets[x] !== sid) {
					if (await this.roomRep.socketInRoom(room.room_name, userSockets[x])) return true;
				}
			}
		}
		return false;
	}

}