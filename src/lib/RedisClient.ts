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
		return this.addStringToList(key, JSON.stringify(obj));
	}

	removeFromList(key, value) {
		let lrem = promisify(this.client.lrem).bind(this.client);
		return lrem(key, 0, value);
	}

	trimList(key, index) {
		let ltrim = promisify(this.client.ltrim).bind(this.client);
		return ltrim(key, 0, index);
	}

	deleteList(key) {
		let del = promisify(this.client.del).bind(this.client);
		return del(key);
	}

	getAllList(key) {
		let lrange = promisify(this.client.lrange).bind(this.client);
		return lrange(key, 0, -1);
	}

	addHashKey(hash, key, value) {
		if (typeof value == "object") value = JSON.stringify(value);
		let hset = promisify(this.client.hset).bind(this.client);
		return hset(hash, key, value);
	}

	getHashKey(hash, key) {
		let hget = promisify(this.client.hget).bind(this.client);
		return hget(hash, key);
	}

	deleteHashKey(hash, key) {
		let hdel = promisify(this.client.hdel).bind(this.client);
		return hdel(hash, key);
	}

	deleteHash(hash) {
		let del = promisify(this.client.del).bind(this.client);
		return del(hash);
	}

	getHash(hash) {
		let hgetall = promisify(this.client.hgetall).bind(this.client);
		return hgetall(hash);
	}

	addSet(key, value) {
		let sadd = promisify(this.client.sadd).bind(this.client);
		return sadd(key, value);
	}

	addExpireSet(key, value, ttl) {
		let setex = promisify(this.client.setex).bind(this.client);
		return setex(key, ttl, value);
	}

	removeSet(key, value) {
		let srem = promisify(this.client.srem).bind(this.client);
		return srem(key, value);
	}

	getSet(key) {
		let smembers = promisify(this.client.smembers).bind(this.client);
		return smembers(key);
	}

	getExpiredSet(...keys) {
		let mget = promisify(this.client.mget).bind(this.client);
		return mget(...keys);
	}

	updateExpiredSet(key, value) {
		let ttl = promisify(this.client.ttl).bind(this.client);
		ttl(key).then(t => {
			console.log(key, t);
			if (t > 0) {
				return this.addExpireSet(key, value, t);
			}else {
				return null;
			}
		});
	}

	checkSetValue(key, value) {
		let sismember = promisify(this.client.sismember).bind(this.client);
		return sismember(key, value);
	}

}