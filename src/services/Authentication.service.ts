import { UsersRepository } from '../repositorys';
import { Logger } from '@overnightjs/logger';
import { injectable } from "tsyringe";
import { User, Err } from '../models';
import { JWT } from '../lib';
import { passwordHash, generateKey, checkPasswordHash } from '../lib/common';
import { AuthenticationApi } from '../interfaces';

@injectable()
export class AuthenticationService implements AuthenticationApi {
	
	constructor(private userRep:UsersRepository) {}

	public async register(username:string, email:string, password:string):Promise<string> {

		let user = new User();
		user.username = username;
		user.user_email = email;
		user.user_password = passwordHash(password);
		user.user_key = generateKey();
		
		if (!(await this.userRep.checkProperty({ user_email: user.user_email }))) {
		 	throw new Err('Invalid Email!');
		} 

		if (!(await this.userRep.checkProperty({ username: user.username }))) {
		 	throw new Err('Invalid Username!');
		}

		let savedUser = await this.userRep.save(user);
		return new JWT().sign(savedUser);
		
	}

	public async login(username:string, password:string):Promise<string> {

		let user = await this.userRep.getByUsername(username);
		if (!user) throw new Err("User not found!", 401);

		if (!checkPasswordHash(password, user.user_password)) {
			Logger.Err("Password check failed!");
			throw new Err("Authentication failed!", 401);
		}
		
		return new JWT().sign(user);
	}

	//change this 
	public async setUserOnline(user:User) {
		user.online = true;
		this.userRep.update(user);
	}

	public async authenticate(token:JWT):Promise<User> {
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