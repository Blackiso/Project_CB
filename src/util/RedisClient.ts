import * as redis from 'redis';
import { Logger } from '@overnightjs/logger';
import { singleton } from 'tsyringe';
import { promisify } from 'util';


@singleton()
export class RedisClient {
	
	private client:any;

	constructor() {
		this.client = redis.createClient();
		this.client.on('connect', () => {
			Logger.Info('Redis connected!');
			this.client.flushall();
		});
		this.client.on('error', (e) => {
			Logger.Err(e);
		});
	}

	addStringToList(key, value) {
		let lpush = promisify(this.client.lpush).bind(this.client);
		return lpush(key, value);
	}

	addObjectTolist(key, obj) {

	}

	removeFromList(key, value) {
		let lrem = promisify(this.client.lrem).bind(this.client);
		return lrem(key, 0, value);
	}

	getAllList(key) {
		let lrange = promisify(this.client.lrange).bind(this.client);
		return lrange(key, 0, -1);
	}
}