import mongoose from 'mongoose';
import { Schema, ObjectId } from 'mongoose';
import { injectable, singleton } from "tsyringe";
import { User, Err } from '../models';
import { Logger } from '@overnightjs/logger';
import { RedisClient } from '../lib';


@injectable()
@singleton()
export class UsersRepository {
	
	private usersSchema;
	private UserModel;

	constructor(private redis:RedisClient) {
		this.usersSchema = new Schema({
			username: String,
			user_email: String,
			user_image: String,
			user_key: String,
			user_password: String,
			register_date: Date,
			user_friends: [ObjectId]
		});
		this.usersSchema.index({ username: 1 }, { collation: { locale: 'en', strength: 2 } });
		this.UserModel = this.getModel();
	}	

	public async save(user:User):Promise<User> {
		let _user = new this.UserModel({
			username: user.username,
			user_email: user.user_email,
			user_image: 'default.png',
			user_key: user.user_key,
			user_password: user.user_password,
			register_date: new Date()
		});

		return await _user.save();
	}

	public async getByEmail(email:string):Promise<User> {
		let user = await this.UserModel.findOne({ user_email: email });
		return user;
	}

	public async getByUsername(username:string):Promise<User> {
		let user = await this.UserModel.findOne({ username: username }).collation({ locale: 'en', strength: 2 });
		return user;
	}

	public async getById(id:number):Promise<User> {
		let user = await this.UserModel.findOne({ _id: id });
		return user;
	}

	public async getSockets(userId) {
		return await this.redis.getAllList('sockets-'+userId);
	}

	public getUsersById(ids:Array<number>):Promise<any> | null {
		return null;
	}

	public async checkProperty(obj) {
		if (await this.UserModel.findOne(obj)) {
			return false;
		}
		return true;
	}

	private getModel() { 
		return mongoose.model('User', this.usersSchema);
	}
	
}