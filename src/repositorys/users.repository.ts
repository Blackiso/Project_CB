import mongoose from 'mongoose';
import { Schema, ObjectId, Model } from 'mongoose';
import { injectable, singleton } from "tsyringe";
import { IUser, Err } from '../models';
import User from '../models/persistence/User';
import { Logger } from '@overnightjs/logger';
import { RedisClient } from '../lib';


@injectable()
@singleton()
export class UsersRepository {
	
	private usersSchema;
	private UserModel;

	constructor(private redis:RedisClient) {
		this.UserModel = User;
	}	

	public async save(user:IUser):Promise<IUser> {
		let _user = new this.UserModel({
			username: user.username,
			user_email: user.user_email,
			user_image: 'default.png',
			user_key: user.user_key,
			user_password: user.user_password,
			register_date: new Date(),
			online: true
		});

		return await _user.save();
	}

	public async getByEmail(email:string):Promise<IUser> {
		return await this.UserModel.findOne({ user_email: email });
	}

	public async getByUsername(username:string):Promise<IUser> {
		return await this.UserModel.findOne({ username: username }).collation({ locale: 'en', strength: 2 });
	}

	public async getById(id:string):Promise<IUser> {
		return await this.UserModel.findOne({ _id: id });
	}

	public async getOnlineByIds(ids:Array<string>):Promise<Array<IUser>> {
		return await this.UserModel.find({ _id: { $in: ids }, online: true });
	}

	public async getSockets(userId) {
		return await this.redis.getAllList('sockets-'+userId);
	}

	public async getByIds(ids:string[]):Promise<IUser[]> {
		return await this.UserModel.find({ _id: { $in: ids } });
	}

	public async checkProperty(obj) {
		if (await this.UserModel.findOne(obj)) {
			return false;
		}
		return true;
	}

	public update(user:Model):Promise<IUser> {
		return user.save();
	}
	
}