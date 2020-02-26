import { UsersDetailsDao } from '../data-access/users-details.dao';
import { Logger } from '@overnightjs/logger';
import { injectable } from "tsyringe";
import { User, Err } from '../models';
import { passwordHash, generateKey, JWT } from '../util';

@injectable()
export class AuthenticationService {
	
	constructor(private userDao:UsersDetailsDao) {}

	public async registerUser(request:Request | any):Promise<string> {
		let data = request.body;
		let user = new User();
		user.user_id = new Date().valueOf();
		user.username = data.username;
		user.user_email = data.email;
		user.user_password = passwordHash(data.password);
		user.user_secret = generateKey();
		user.user_agent = request.useragent.browser+" "+request.useragent.version+" "+request.useragent.os+" "+request.useragent.platform;
		
		return new Promise((resolve, reject) => {

			this.userDao.emailExist(user.user_email).then(x => {

				if (x) {
					reject(new Err("Email already exist!"));
				}else {
					this.userDao.saveUser(user)
						.then(x => {
							let token = new JWT().sign(user);
							resolve(token);
						})
						.catch(err => {
							reject(err);
						});
				}

			})
			.catch(err => {
				reject(err);
			});

		});

	}
}