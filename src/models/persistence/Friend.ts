import { IUser } from './User';

export class Friend {
	
	_id:string;
	username:string;
	user_image:string;
	online:boolean = false;

	constructor(user:IUser) {
		this._id = user._id;
		this.username = user.username;
		this.user_image = user.user_image;
		this.online = user.online;
	}
}  