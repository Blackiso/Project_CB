import { Room } from '../persistence/Room';

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

 	constructor(room:Room, is_mod:boolean, is_admin:boolean) {
 		this._id = room._id;
 		this.room_name = room.room_name;
 		this.room_owner = room.room_owner;
 		this.room_options = room.room_options;
 		this.invited_users = room.invited_users;
 		this.user.is_mod = is_mod;
 		this.user.is_admin = is_admin;
 	}

}