import jwt from 'jsonwebtoken';
import { User } from '../models';

export class JWT {

	private options = {
		expiresIn: '7d',
		algorithm: 'HS256'
	};
	
	public sign(user:User):string {
		let payload = {
			uid: user._id,
			unm: user.username,
			eml: user.user_email
		};

		return  jwt.sign(payload, user.user_key, this.options);
	}

	public verify(token:string, user:User):boolean {
		return jwt.verify(token, user.user_key);
	}

	public decode(token:string) {
		return jwt.decode(token, {complete: true}).payload;
	}
}