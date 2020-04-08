import { Room } from './';

export class RoomResponse {
 	
 	_id:string;
 	room_name:string;
 	room_owner:object;
 	online_users:number;
 	room_options:any = {
 		privacy: ""
 	};

 	constructor(room:Room) {
 		this._id = room._id;
 		this.room_name = room.room_name;
 		this.room_owner = room.room_owner;
 		this.online_users = room.online_users;
 		this.room_options.privacy = room.room_options.privacy;
 	}
}