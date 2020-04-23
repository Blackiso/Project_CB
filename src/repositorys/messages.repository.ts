import { injectable, singleton } from "tsyringe";
import { Err, Message, Room } from '../models';
import { Logger } from '@overnightjs/logger';
import { RedisClient } from '../lib';


@injectable()
@singleton()
export class MessagesRepository {

	constructor(private redis:RedisClient) {}

	public async save(message:Message, roomName:string) {
		let rm = roomName+'-'+message._id;
		await this.redis.addStringToList('messages-'+roomName, rm);
		return this.redis.addExpireSet(rm, JSON.stringify(message), 600);		
	}

	public async getMessagesIds(roomName:string):Promise<Array<string>> {
		return await this.redis.getAllList('messages-'+roomName);
	}

	public async getMessagesByIds(ids:Array<string>):Promise<Array<Message>> {
		let messagesStrings = await this.redis.getExpiredSet(...ids) as Array<string>;
		return messagesStrings.map(msg => JSON.parse(msg)) as Array<Message>;
	}

	public async update(roomName:string, id:string, msg:Message) {
		await this.redis.updateExpiredSet(roomName+'-'+id, JSON.stringify(msg));
	}

	public async getMessageById(roomName:string, id:string):Promise<Message | null> {
		try {
			let message = await this.redis.getExpiredSet(roomName+'-'+id);
			return  JSON.parse(message);
		}catch(e) {
			Logger.Warn(e);
			return null;
		}
	}

	public async deleteMessageId(roomName:string, index:number) {
		await this.redis.trimList('messages-'+roomName, index);
	}

	public async deleteAllMessageIds(roomName:string) {
		await this.redis.deleteList('messages-'+roomName);
	}

}