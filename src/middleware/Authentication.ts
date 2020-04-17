import { injectable, singleton } from "tsyringe";
import { Logger } from '@overnightjs/logger';
import { User } from '../data-access-layer/models';
import { JWT } from '../util';
import { UsersDetailsRepository } from '../data-access-layer';
import { Err } from '../domain-layer/domain-models';

@injectable()
@singleton()
export class Authentication {
	
	private error:string = "Unautorized request!";
	private errorno:number = 401;

	constructor(private userRep:UsersDetailsRepository) {}

	public async authenticate(req:any, res:any, next:any) {

		try {
			let token = req.jwt as JWT;
			if (token == null) throw new Err('Token not found!');
			let payload = token.getPayload();
			let user = await this.userRep.getById(payload.uid);
			
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
				let user = await this.userRep.getById(payload.uid);
				
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