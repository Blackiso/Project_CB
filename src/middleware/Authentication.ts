import { injectable } from "tsyringe";
import { Logger } from '@overnightjs/logger';
import { Err, User } from '../models';
import { JWT } from '../util';
import { UsersDetailsDao } from '../data-access/users-details.dao';

@injectable()
export class Authentication {
	
	private error:string = "Unautorized request!";
	private errorno:number = 401;
	private jwt:JWT;

	constructor(private userDao:UsersDetailsDao) {
		this.jwt = new JWT();
	}

	public async authenticate(req:any, res:any, next:any) {

		try {
			let token = req.jwt;
			if (token == null) throw new Error();
			let payload = this.jwt.decode(token);
			let user = await this.userDao.getUserById(payload.uid);
			
			if (!this.jwt.verify(token, user)) {
				Logger.Err("Invalid token!");
			}else {
				req.user = user;
				next();
			}
		}catch(e) {
			return res.status(this.errorno).send(new Err(this.error, this.errorno));
		}
		
	}
}