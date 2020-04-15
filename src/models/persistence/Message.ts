import { User } from './User';

export class Message {
	
	_id:string;
	msg:string;
	date:Date;
	user:any = {
		_id: null,
		username: null,
		user_image: null
	};
	deleted:boolean = false;

	constructor(id:string, msg:string, date:Date, user:User) {
		this._id = id;
		this.msg = msg;
		this.date = date;
		this.user._id = user._id.toString();
		this.user.username = user.username;
		this.user.user_image = user.user_image;
	}

}