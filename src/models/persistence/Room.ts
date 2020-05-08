import mongoose, { Schema, Document, ObjectId } from 'mongoose';

export interface IRoom extends Document {
	_id:ObjectId;
 	room_name:string;
 	room_owner: {
 		_id:ObjectId;
 		username:string;
 		user_image:string;
 	};
 	room_options: {
		privacy:string;
		language_filter:boolean;
		allow_invites:boolean;
 	};
 	room_mods:Array<string>;
 	room_users:Array<string>;
 	room_banned:Array<string>;
 	invited_users:Array<{ _id:string; username:string; invited_by:string }>;
 	online_users:number;
}

const RoomSchema = new Schema({
	room_name: String,
	room_owner: {
		_id: Object,
		username: String,
		user_image: String
	},
	room_options: {
		privacy: String,
		language_filter: Boolean,
		allow_invites: Boolean
	},
	room_mods: [String],
	room_users: [String],
	room_banned: [String],
	invited_users: [
		{
			_id: String,
			username: String,
			invited_by: String
		}
	],
	online_users: Number
});

RoomSchema.index({ room_name: 1 }, { collation: { locale: 'en', strength: 2 } });
let model = mongoose.model<IRoom>('Room', RoomSchema);

export default model;
