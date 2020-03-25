import { injectable } from "tsyringe";
import { MongoDb, ModelMapper } from '../util';
import { User, Err } from '../models';
import { Logger } from '@overnightjs/logger';


@injectable()
export class UsersDetailsDao {
	

	constructor(private db:MongoDb) {}

	public saveUser(user:User):Promise<any> {
		
	}

	public getUserByEmail(email:string):Promise<User> {
		
	}

	public getUserById(id:number):Promise<User> {
		
	}

	public getUsersById(ids:Array<number>):Promise<any> {
		
	}

	public emailExist(email:string):Promise<boolean> {

	}
}