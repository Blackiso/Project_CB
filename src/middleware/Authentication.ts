import { injectable, singleton } from "tsyringe";
import { Logger } from '@overnightjs/logger';
import { Err, User } from '../models';
import { JWT } from '../util';
import { UsersDetailsDao } from '../data-access/users-details.dao';

@injectable()
@singleton()
export class Authentication {
	
	private error:string = "Unautorized request!";
	private errorno:number = 401;

	constructor(private userDao:UsersDetailsDao, private jwt:JWT) {}

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

	public async authenticateWS(socket, next) {
		Logger.Info('Trying to authenticate socket');
		try {

			if (socket.handshake.query && socket.handshake.query.token) {
				Logger.Info('Token found => '+ socket.handshake.query.token);
				let token = socket.handshake.query.token;
				let payload = this.jwt.decode(token);
				let user = await this.userDao.getUserById(payload.uid);
				
				if (!this.jwt.verify(token, user)) {
					Logger.Err('Invalid token!');
					throw new Error('Invalid token!');
				}else {
					socket.user = user;
					next();
				}
			}else {
				Logger.Err('Token not found');
				throw new Error('Token not found');
			}
			
		}catch(e) {
			Logger.Err(e.error || 'Token Error');
			next(new Error('Authentication error'));
		}

	}
}