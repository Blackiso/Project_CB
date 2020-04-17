import jwt from 'jsonwebtoken';
import { User } from '../data-access-layer/models';

export class JWT {

	private token:string;
	private options = {
		expiresIn: '7d',
		algorithm: 'HS256'
	};
	
	constructor(token?) {
		this.token = token ?? '';
	}

	public sign(user:User):string {
		let payload = {
			uid: user._id,
			unm: user.username,
			eml: user.user_email
		};

		return  jwt.sign(payload, user.user_key, this.options);
	}

	public verify(user:User):boolean {
		return jwt.verify(this.token, user.user_key);
	}

	public decode(token:string) {
		return jwt.decode(token, {complete: true}).payload;
	}

	public getPayload() {
		return this.decode(this.token);
	}
}