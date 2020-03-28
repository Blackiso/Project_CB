import { Room } from './';

export class RoomResponse {
 	
 	_id:string;
 	room_name:string;
 	room_owner:object;

 	constructor(room:Room) {
 		this._id = room._id;
 		this.room_name = room.room_name;
 		this.room_owner = room.room_owner;
 	}
}