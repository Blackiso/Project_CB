import { injectable, singleton } from "tsyringe";
import { Logger } from '@overnightjs/logger';
import { Err, User } from '../models';
import { JWT } from '../util';
import { UsersDetailsDao } from '../data-access/';

@injectable()
@singleton()
export class Authentication {
	
	private error:string = "Unautorized request!";
	private errorno:number = 401;

	constructor(private userDao:UsersDetailsDao) {}

	public async authenticate(req:any, res:any, next:any) {

		try {
			let token = req.jwt as JWT;
			if (token == null) throw new Err('Token not found!');
			let payload = token.getPayload();
			let user = await this.userDao.getUserById(payload.uid);
			
			if (!token.verify(user)) {
				Logger.Err("Invalid token!");
			}else {
				req.user = user;
				next();
			}
		}catch(e) {
			Logger.Err('Unautorized request!');
			return res.status(this.errorno).send(new Err(this.error, this.errorno));
		}
		
	}

	public async authenticateWS(socket, next) {
		Logger.Info('Trying to authenticate socket');
		try {

			if (socket.handshake.query && socket.handshake.query.token) {
				Logger.Info('Token found => '+ socket.handshake.query.token);
				let token = new JWT(socket.handshake.query.token);
				let payload = token.getPayload();
				let user = await this.userDao.getUserById(payload.uid);
				
				if (!token.verify(user)) {
					Logger.Err('Invalid token!');
					throw new Err('Invalid token!');
				}else {
					socket.user = user;
					next();
				}
			}else {
				Logger.Err('Token not found');
				throw new Err('Token not found');
			}
			
		}catch(e) {
			Logger.Err(e.error || 'Token Error');
			next(new Err('Authentication error'));
		}

	}
}