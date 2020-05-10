import { IRoom } from '../persistence/Room';
import { IUser } from '../persistence/User';

export class RoomDetailsAdv {
 	
 	_id:string;
 	room_name:string;
 	room_owner = {
 		_id: "",
 		username: "",
 		user_image: ""
 	};
 	room_options:any = {
 		privacy: "",
 		language_filter: false,
 		allow_invites: true
 	};
 	user:any = {
 		is_mod: false,
 		is_admin: false
 	};
 	invited_users:Array<object>;

 	constructor(room:IRoom, user:IUser) {
 		this._id = room._id;
 		this.room_name = room.room_name;
 		this.room_owner = room.room_owner;
 		this.room_options = room.room_options;
 		this.invited_users = room.invited_users;
 		this.user.is_mod = user.is_mod(room);
 		this.user.is_admin = user.is_admin(room);
 	}

}