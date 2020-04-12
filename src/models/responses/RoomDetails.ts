import { Room } from './Room';

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
 	room_mods:Array<string>;

 	constructor(room:Room) {
 		this._id = room._id;
 		this.room_name = room.room_name;
 		this.room_owner = room.room_owner;
 		this.room_options.privacy = room.room_options.privacy;
 		this.room_mods = room.room_mods;
 	}

}