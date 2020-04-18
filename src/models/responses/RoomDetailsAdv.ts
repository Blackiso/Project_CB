import { Room } from '../persistence/Room';

export class RoomDetailsAdv {
 	
 	_id:string;
 	room_name:string;
 	room_owner = {
 		_id: "",
 		username: "",
 		user_image: ""
 	};
 	room_options = {
 		privacy: "",
 		language_filter: false,
 		allow_invites: true
 	};
 	room_mods:Array<string>;
 	room_banned:Array<string>;
 	invited_users:Array<object>;

 	constructor(room:Room) {
 		this._id = room._id;
 		this.room_name = room.room_name;
 		this.room_owner = room.room_owner;
 		this.room_options = room.room_options;
 		this.room_mods = room.room_mods;
 		this.invited_users = room.invited_users;
 		this.room_banned = room.room_banned;
 	}

}