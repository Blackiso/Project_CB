import { UsersRepository } from '../repositorys';
import { Logger } from '@overnightjs/logger';
import { injectable } from "tsyringe";
import { IUser, Err } from '../models';
import { JWT } from '../lib';
import { passwordHash, generateKey, checkPasswordHash } from '../lib/common';
import { AuthenticationApi } from '../interfaces';

@injectable()
export class AuthenticationService {
	
	constructor(private userRep:UsersRepository) {}

	public async login(username:string, password:string):Promise<IUser> {

		let user = await this.userRep.getByUsername(username);

		if (!user || !checkPasswordHash(password, user.user_password)) {
			Logger.Err("Password check failed or User not found!");
			throw new Err("Authentication failed!", 401);
		}
		
		return user;
	}

	public async authenticate(token:JWT):Promise<IUser> {
		if (!token) throw new Err('Token not found!');
		let payload = token.getPayload();
		let user = await this.userRep.getById(payload.uid);

		if (!token.verify(user)) {
			throw new Err('Invalid token!');
		}else {
			return user;
		}
	}
}