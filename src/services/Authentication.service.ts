import { UsersDetailsDaoSql, UsersDetailsDao } from '../data-access';
import { Logger } from '@overnightjs/logger';
import { injectable } from "tsyringe";
import { User, Err } from '../models';
import { passwordHash, generateKey, JWT, ModelMapper, checkPasswordHash } from '../util';

@injectable()
export class AuthenticationService {
	
	constructor(private userDao:UsersDetailsDaoSql, private userMongo:UsersDetailsDao) {}

	public registerUser(request:Request | any):Promise<string> {
		let data = request.body;
		let user = new User();
		user.user_id = new Date().valueOf();
		user.username = data.username;
		user.user_email = data.email;
		user.user_password = passwordHash(data.password);
		user.user_secret = generateKey();
		user.user_agent = request.useragent.browser+" "+request.useragent.version+" "+request.useragent.os+" "+request.useragent.platform;
		
		return new Promise((resolve, reject) => {

			Promise.all([this.userDao.emailExist(user.user_email), this.userDao.saveUser(user)])
				.then(x => {
					let token = new JWT().sign(user);
					resolve(token);
				})
				.catch(err => {
					reject(err);
				});
				
		});
	}

	public loginUser(data:any):Promise<string> {
		return new Promise((resolve, reject) => {
			this.userDao.getUserByEmail(data.email).then(
				user => {
					if (!checkPasswordHash(data.password, user.user_password)) {
						Logger.Err("Password check failed!");
						reject(new Err("User not found!"));
					}else {
						let token = new JWT().sign(user);
						resolve(token);
					}
				}
			)
			.catch(err => {
				reject(new Err("User not found!"));
			});
		});
	}
}