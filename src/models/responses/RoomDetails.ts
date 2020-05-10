import { IRoom } from '../persistence/Room';
import { IUser } from '../persistence/User';

export class RoomDetails {
 	
 	_id:string;
 	room_name:string;
 	room_owner:any = {
 		_id: "",
 		username: "",
 		user_image: ""
 	};
 	room_options:any = {
 		privacy: ""
 	};
 	user:any = {
 		is_mod: false,
 		is_admin: false
 	};

 	constructor(room:IRoom, user:IUser) {
 		this._id = room._id;
 		this.room_name = room.room_name;
 		this.room_owner = room.room_owner;
 		this.room_options.privacy = room.room_options.privacy;
 		this.user.is_mod = user.is_mod(room);
 		this.user.is_admin = user.is_admin(room);
 	}

}