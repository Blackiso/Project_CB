import mongoose, { Schema, Document, ObjectId } from 'mongoose';
import { IRoom } from './Room';


export interface IUser extends Document {
 	
 	_id:ObjectId;
 	username:string;
 	user_email:string;
 	user_password:string;
 	user_image:string;
 	user_key:string;
 	user_friends:Array<string>;
 	friends_requests:Array<string>;
 	online:boolean;

 	is_admin(room:IRoom):boolean;
 	is_mod(room:IRoom):boolean;
 	can_change(room:IRoom):boolean;

}

const UserSchema = new Schema({
	username: String,
	user_email: String,
	user_image: String,
	user_key: String,
	user_password: String,
	register_date: Date,
	friends_requests: [String],
	user_friends: [String],
	online: Boolean
});

UserSchema.index({ username: 1 }, { collation: { locale: 'en', strength: 2 } });

UserSchema.methods.is_mod = function (room:IRoom):boolean {
	return room.room_mods.includes(this._id.toString());
};

UserSchema.methods.is_admin = function (room:IRoom):boolean {
	return room.room_owner._id.toString() == this._id.toString();
};

UserSchema.methods.in_room = function (room:IRoom):boolean {
	return room.room_users.includes(this._id.toString());
};

UserSchema.methods.can_operate = function (room:IRoom):boolean {
	return this.is_admin(room) || this.is_mod(room);
};

export default mongoose.model<IUser>('User', UserSchema);