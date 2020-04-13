import { User } from '../persistence/User';

export class UserResponse {
 	
 	_id:string;
 	username:string;
 	user_email:string;
 	user_image:string;

 	constructor(user:User) {
 		this._id = user._id;
 		this.username = user.username;
 		this.user_email = user.user_email;
 		this.user_image = user.user_image;
 	}
}