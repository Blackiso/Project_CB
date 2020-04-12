import { injectable, singleton } from "tsyringe";
import { Err, Message } from '../models';
import { Logger } from '@overnightjs/logger';
import { RedisClient } from '../util/RedisClient';


@injectable()
@singleton()
export class MessagesDao {

	constructor(private redis:RedisClient) {}

	public async saveMessage(message:Message, roomName:string) {
		let rm = roomName+'-'+message._id;
		await this.redis.addStringToList('messages-'+roomName, rm);
		return this.redis.addExpireSet(rm, JSON.stringify(message), 600);		
	}

	public async getRoomMessages(roomName:string):Promise<Array<Message>> {
		let messages = [] as Array<Message>;
		let ids = await this.redis.getAllList('messages-'+roomName);
		let messagesStrings = await this.redis.getMultipleSets(ids) as Array<string>;
		messagesStrings.forEach(msg => {
			messages.push(JSON.parse(msg));
		});

		return messages;
	} 

	public async deleteMessage(roomName:string, messageId:string) {

	}

}