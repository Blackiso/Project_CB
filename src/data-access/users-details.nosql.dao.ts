import mongoose from 'mongoose';
import { Schema, ObjectId, Model } from 'mongoose';
import { injectable, singleton } from "tsyringe";
import { User, Err } from '../models';
import { Logger } from '@overnightjs/logger';


@injectable()
@singleton()
export class UsersDetailsDao {
	
	private usersSchema;
	private UserModel;

	constructor() {
		this.usersSchema = new Schema({
			username: String,
			user_email: String,
			user_image: String,
			user_key: String,
			user_password: String,
			register_date: Date,
			user_friends: [ObjectId],
			joined_rooms: [ObjectId]
		});
		this.UserModel = this.getUserModel();
	}	

	public async saveUser(user:User):Promise<Model> {
		let UserModel = this.getUserModel();
		let _user = new UserModel({
			username: user.username,
			user_email: user.user_email,
			user_image: 'default.png',
			user_key: user.user_key,
			user_password: user.user_password,
			register_date: new Date()
		});
		return await _user.save();
	}

	public async getUserByEmail(email:string):Promise<User | null> {
		let user = await this.UserModel.findOne({ user_email: email });
		return user;
	}

	public async getUserById(id:number):Promise<User> {
		let user = await this.UserModel.findOne({ _id: id });
		return user;
	}

	public getUsersById(ids:Array<number>):Promise<any> {
		return null;
	}

	public async checkProperty(obj) {
		if (await this.UserModel.findOne(obj)) {
			return false;
		}
		return true;
	}

	private getUserModel() { 
		return mongoose.model('User', this.usersSchema);
	}
}