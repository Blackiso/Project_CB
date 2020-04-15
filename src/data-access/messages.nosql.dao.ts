import { injectable, singleton } from "tsyringe";
import { Err, Message, Room } from '../models';
import { Logger } from '@overnightjs/logger';
import { RedisClient } from '../util/RedisClient';


@injectable()
@singleton()
export class MessagesDao {

	constructor(private redis:RedisClient) {}

	public async saveMessage(message:Message, roomName:string) {
		let rm = roomName+'-'+message._id;
		await this.redis.addStringToList('messages-'+roomName, rm);
		return this.redis.addExpireSet(rm, JSON.stringify(message), /*600*/ 30);		
	}

	public async getMessagesIds(roomName:string):Promise<Array<string>> {
		return await this.redis.getAllList('messages-'+roomName);
	}

	public async getMessagesByIds(ids:Array<string>):Promise<Array<Message>> {
		let messagesStrings = await this.redis.getMultipleSets(ids) as Array<string>;
		return messagesStrings.map(msg => JSON.parse(msg)) as Array<Message>;
	}

	public async deleteMessage(roomName:string, messageId:string) {

	}

	public async deleteMessageId(roomName:string, index:number) {
		await this.redis.trimList('messages-'+roomName, index);
	}

	public async deleteAllMessageIds(roomName:string) {
		await this.redis.deleteList('messages-'+roomName);
	}

}