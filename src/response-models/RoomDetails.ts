import { Room } from '../persistence/Room';

export class RoomDetails {
 	
 	_id:string;
 	room_name:string;
 	room_owner:any = {
 		_id: null,
 		username: null,
 		user_image: null
 	};
 	room_options:any = {
 		privacy: null
 	};

 	constructor(room:Room) {
 		this._id = room._id;
 		this.room_name = room.room_name;
 		this.room_owner = room.room_owner;
 		this.room_options.privacy = room.room_options.privacy;
 	}

}