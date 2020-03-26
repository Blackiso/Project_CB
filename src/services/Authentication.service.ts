import { UsersDetailsDao } from '../data-access';
import { Logger } from '@overnightjs/logger';
import { injectable } from "tsyringe";
import { User, Err } from '../models';
import { passwordHash, generateKey, JWT, checkPasswordHash } from '../util';

@injectable()
export class AuthenticationService {
	
	constructor(private userDao:UsersDetailsDao) {}

	public async registerUser(request:Request | any):Promise<string> {

		let data = request.body;
		let user = new User();
		user.username = data.username;
		user.user_email = data.email;
		user.user_password = passwordHash(data.password);
		user.user_key = generateKey();
		
		if (!(await this.userDao.checkProperty({ user_email: user.user_email }))) {
		 	throw new Err('Invalid Email!');
		} 

		if (!(await this.userDao.checkProperty({ username: user.username }))) {
		 	throw new Err('Invalid Username!');
		}

		let savedUser = await this.userDao.saveUser(user);
		return new JWT().sign(savedUser);
		
	}

	public async loginUser(data:any):Promise<string> {

		let user = await this.userDao.getUserByEmail(data.email);
		if (!user) throw new Err("User not found!", 401);

		if (!checkPasswordHash(data.password, user.user_password)) {
			Logger.Err("Password check failed!");
			throw new Err("Authentication failed!", 401);
		}
		
		return new JWT().sign(user);
	}
}