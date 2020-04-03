/*import { injectable } from "tsyringe";
import { Database, ModelMapper } from '../util';
import { User, Err } from '../models';
import { Logger } from '@overnightjs/logger';


@injectable()
export class UsersDetailsDaoSql {
	
	private insertQr:string = "INSERT INTO users_details VALUES (?,?,?,?,?,?,?)";
	private selectByIdQr:string = "SELECT * FROM users_details WHERE user_id=?";
	private selectByEmailQr:string = "SELECT * FROM users_details WHERE user_email=?";
	private selectUsers:string = "SELECT user_id, username FROM users_details WHERE user_id IN (?)";

	constructor(private db:Database) {}

	public saveUser(user:User):Promise<any> {
		return this.db.insert(this.insertQr, user.user_id, user.username, user.user_email, user.user_password, user.user_location, user.user_agent, user.user_secret);
	}

	public getUserByEmail(email:string):Promise<User> {
		return this.returnUsersPromise(this.selectByEmailQr, email);
	}

	public getUserById(id:number):Promise<User> {
		return this.returnUsersPromise(this.selectByIdQr, id);
	}

	public getUsersById(ids:Array<number>):Promise<any> {
		return this.db.selectIn(this.selectUsers, ids);
	}

	private returnUsersPromise(query, ...args):Promise<User> {
		return new Promise((resolve, reject) => {
			this.db.select(query, ...args).then(data => {
				if (data.length == 0) {
					reject(new Err('User not found!'));
				}else {
					resolve(<User> ModelMapper(data[0], new User()));
				}
			});
		});
	}

	public async emailExist(email:string):Promise<boolean> {
		let result = await this.db.select(this.selectByEmailQr, email);
		if (result.length == 0) {
		 	return true
		}else {
			throw new Err("Email already exist!");	
		}
	}
}*/