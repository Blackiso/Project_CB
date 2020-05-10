import { RoomsRepository, MessagesRepository, UsersRepository } from '../repositorys';
import { Logger } from '@overnightjs/logger';
import { injectable, singleton } from "tsyringe";
import { Err, IUser, IRoom, Message } from '../models';
import { generate24Bit, clearNullArray } from '../lib/common';
import { MessagesApi } from '../interfaces';
import { EventEmitter } from 'events';


@injectable()
@singleton()
export class MessagesService implements MessagesApi<IUser, Message> {

	private messagesEvents:EventEmitter = new EventEmitter();	
	
	constructor(
		private roomRep:RoomsRepository,
		private msgRep:MessagesRepository,
		private usersRep:UsersRepository
	) {}

	public get events() {
		return this.messagesEvents;
	}

	public async deleteAllRoomMessages(room:IRoom) {
		await this.msgRep.deleteAllMessageIds(room.room_name);
	}

	public async save(roomId:string, user:IUser, msg:string):Promise<Message> {
		let room = await this.getRoom(roomId, user);
		let message = new Message(generate24Bit(), msg, new Date(), user);

		await this.canUserMessageRoom(room, user);
		await this.msgRep.save(message, room.room_name);

		Logger.Info(user.username+': '+msg+' to '+roomId);
		this.messagesEvents.emit('room_message', message, room.room_name);
		return message;
	}

	public async list(roomId:string, user:IUser):Promise<Message[]> {
		let room = await this.getRoom(roomId, user);
		await this.canUserMessageRoom(room, user);

		let messagesIds = await this.msgRep.getMessagesIds(room.room_name);
		if (messagesIds.length == 0) return [];
		let messages = await this.msgRep.getMessagesByIds(messagesIds);
		let index;

		for (let i = 0; i < messages.length; i++) {
			if (messages[i] == null) {
				index = i-1;
				break;
			}
		}

		if (index !== undefined && index !== null) {

			if (index > -1) {
				await this.msgRep.deleteMessageId(room.room_name, index);
			}else {
				await this.msgRep.deleteAllMessageIds(room.room_name);
			}
		}

		return clearNullArray(messages).reverse();
	}

	public async delete(roomId:string, user:IUser, messageId:string) {
		let room = await this.getRoom(roomId, user);
		await this.canUserMessageRoom(room, user);

		if ((room.room_mods.includes(user._id) || room.room_owner._id.toString() == user._id.toString())) {
			
			let message = await this.msgRep.getMessageById(room.room_name, messageId);
			let delMsg = 'Message deleted by a moderator.';

			if (message !== null) {
				message.msg = delMsg;
				message.deleted = true;
				await this.msgRep.update(room.room_name, messageId, message);
			}else {
				message = { _id: messageId, msg: delMsg, deleted: true } as any;
			}

			this.messagesEvents.emit('message_update', message, room.room_name);

		}else {
			throw new Err('Error can\'t modify room', 401);
		}

	}

	private async canUserMessageRoom(room:IRoom, user:IUser) {
		if (room.room_banned.includes(user._id)) {
			throw new Err('User is banned from room', 401);
		}

		if (room.room_options.privacy == 'private' && !room.room_users.includes(user._id.toString())) {
			throw new Err('Error sending a message! (private room)', 401);
		}

		let userRooms = await this.roomRep.getUserRooms(user);
		if (!userRooms.includes(room.room_name)) {
			throw new Err('Error sending a message! (not in room)', 401);
		}
	}

	private async getRoom(roomId, user:IUser) {
		let room = await this.roomRep.getById(roomId);
		if (!room) throw new Err('Room not found!');
		return room as IRoom;
	}

}