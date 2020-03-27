import { User, Room } from './';

export class RoomResponse {
 	
 	_id:string;
 	room_name:string;
 	room_owner:object;
 	room_privacy:string;
 	room_options: string;

 	constructor(room:Room) {
 		this._id = room._id;
 		this.room_name = room.room_name;
 		this.room_privacy = room.room_privacy;
 		this.room_options = room.room_options;
 	}

 	set owner(user:User) {
 		this.room_owner = {
 			_id: user._id,
 			username: user.username,
 			user_image: user.user_image
 		};
 	}
}