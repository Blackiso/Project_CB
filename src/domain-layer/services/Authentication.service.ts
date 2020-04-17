import { UsersDetailsRepository } from '../../data-access-layer';
import { Logger } from '@overnightjs/logger';
import { injectable } from "tsyringe";
import { User } from '../../data-access-layer/models';
import { Err } from '../../domain-layer/domain-models';
import { passwordHash, generateKey, JWT, checkPasswordHash } from '../../util';
import { Authentication } from '../interfaces';

@injectable()
export class AuthenticationService implements Authentication {
	
	constructor(private userRep:UsersDetailsRepository) {}

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
}