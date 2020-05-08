import { User } from './persistence/User';

export class RoomUser {

	_id:string;
 	username:string;
 	user_image:string;
 	is_admin:boolean;
 	is_mod:boolean;
 	is_friend:boolean;

 	constructor(user:User, is_friend:boolean = false) {
 		this._id = user._id;
 		this.username = user.username;
 		this.user_image = user.user_image;
 		this.is_friend = is_friend;
 	}

}