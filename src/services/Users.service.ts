import { Logger } from '@overnightjs/logger';
import { injectable, singleton } from "tsyringe";
import { IUser, Err, IRoom, RoomUser } from '../models';
import { RoomsRepository, UsersRepository, MessagesRepository } from '../repositorys';
import { RoomsApi } from '../interfaces';
import { EventEmitter } from 'events';
import { RoomUsersService } from './RoomUsers.service';
import { passwordHash, generateKey, checkPasswordHash } from '../lib/common';


@injectable()
@singleton()
export class UsersService {

	constructor(private userRep:UsersRepository) {}

	public async createUser(username:string, email:string, password:string):Promise<IUser> {
		let user = {} as IUser;
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

		return await this.userRep.save(user);
	}

	public async disconnected(user:IUser) {

	}

	public async connected(user:IUser) {
		user.online = true;
		this.userRep.update(user);
	}

}