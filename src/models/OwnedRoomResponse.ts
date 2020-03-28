import { Room } from './';

export class OwnedRoomResponse {
 	
 	_id:string;
 	room_name:string;
 	room_owner:object;
 	room_options:object;

 	constructor(room:Room) {
 		this._id = room._id;
 		this.room_name = room.room_name;
 		this.room_owner = room.room_owner;
 		this.room_options = room.room_options;
 	}
}