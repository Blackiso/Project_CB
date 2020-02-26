import jwt from 'jsonwebtoken';
import { User } from '../models';

export class JWT {

	private options = {
		expiresIn: '7d',
		algorithm: 'HS256'
	};
	
	public sign(user:User):string {
		let payload = {
			uid: user.user_id,
			unm: user.username,
			eml: user.user_email
		};

		return  jwt.sign(payload, user.user_secret, this.options);
	}

	public verify(user:User, token:string) {

	}

	public decode(token:string) {

	}
}