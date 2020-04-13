import { User } from './persistence/User';

export class RoomUser {

	_id:string;
 	username:string;
 	user_image:string;
 	is_admin:boolean;
 	is_mod:boolean;

 	constructor(user:User) {
 		this._id = user._id;
 		this.username = user.username;
 		this.user_image = user.user_image;
 	}

}