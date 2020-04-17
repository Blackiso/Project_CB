import { SocketsHandler } from '../../websocket/SocketsHandler';
import { RoomsRepository, MessagesRepository } from '../../data-access-layer';
import { RedisClient } from '../../util/RedisClient';
import { Logger } from '@overnightjs/logger';
import { injectable, singleton } from "tsyringe";
import { User, Room, Message } from '../../data-access-layer/models';
import { generate24Bit, clearNullArray } from '../../util';
import { Err } from '../../domain-layer/domain-models';



@injectable()
@singleton()
export class MessagesService {
	
	constructor(
		private roomRep:RoomsRepository, 
		private ws:SocketsHandler, 
		private redis:RedisClient,
		private msgRep:MessagesRepository
	) {}

	public async newMessage(roomId, user:User, msg) {
		
		let room = await this.getRoom(roomId, user);
		let message = new Message(generate24Bit(), msg, new Date(), user);
		await this.msgRep.saveMessage(message, room.room_name);

		Logger.Info(user.username+': '+msg+' to '+roomId);

		this.ws.sendToRoom('MESG', JSON.stringify(message), room.room_name);

	}

	public async listMessages(roomId, user:User) {
		let room = await this.getRoom(roomId, user);
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

	private async canUserMessageRoom(room:Room, user:User) {
		if (room.room_banned.includes(user._id)) {
			throw new Err('User is banned from room');
		}

		if (room.room_options.privacy == 'private' && !room.room_users.includes(user._id)) {
			throw new Err('Error sending a message! (private room)');
		}

		let userRooms = await this.redis.getSet('rooms-'+user._id);
		if (!userRooms.includes(room.room_name)) {
			throw new Err('Error sending a message! (not in room)');
		}
	}

	private async getRoom(roomId, user:User) {
		let room = await this.roomRep.getById(roomId);
		if (!room) throw new Err('Room not found!');
		await this.canUserMessageRoom(room, user);
		return room as Room;
	}

}