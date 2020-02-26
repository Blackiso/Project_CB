import { injectable } from "tsyringe";
import { Database, ModelMapper } from '../util';
import { User } from '../models';
import { Logger } from '@overnightjs/logger';


@injectable()
export class UsersDetailsDao {
	
	private insertQr:string = "INSERT INTO users_details VALUES (?,?,?,?,?,?,?)";
	private selectByIdQr:string = "SELECT * FROM users_details WHERE user_id=?";
	private selectByEmailQr:string = "SELECT * FROM users_details WHERE user_email=?";

	constructor(private db:Database) {}

	public saveUser(user:User):Promise<any> {
		return this.db.insert(this.insertQr, user.user_id, user.username, user.user_email, user.user_password, user.user_location, user.user_agent, user.user_secret);
	}

	public getUserByEmail(email:string):Promise<User> {
		return new Promise((resolve, reject) => {
			this.db.select(this.selectByEmailQr, email).then(data => {
				if (data.length == 0) {
					reject();
				}else {
					resolve(<User> ModelMapper(data[0], new User()));
				}
			});
		});
	}

	public getUserById(id:number):Promise<User> {
		return new Promise((resolve, reject) => {
			this.db.select(this.selectByIdQr, id).then(data => {
				if (data.length == 0) {
					reject();
				}else {
					resolve(<User> ModelMapper(data[0], new User()));
				}
			});
		});
	}

	public async emailExist(email:string):Promise<boolean> {
		try {
			let result = await this.db.select(this.selectByEmailQr, email);
			return result.length > 0;
		}catch(e) {
			Logger.Err(e.error || e);
			return true;
		}
	}
}