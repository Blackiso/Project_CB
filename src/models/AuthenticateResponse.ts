import { User } from './User';

export class AuthenticateResponse {
	
	private user_id:number;
	private username:string;
	private user_email:string;

	constructor(user:User) {
		this.user_id = user.user_id;
		this.username = user.username;
		this.user_email = user.user_email;
	}
}