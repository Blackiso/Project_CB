import { Logger } from '@overnightjs/logger';
import { injectable, singleton } from "tsyringe";
import { User, Err, Friend } from '../models';
import { UsersRepository } from '../repositorys';



@injectable()
@singleton()
export class FriendsListService {
	
	constructor(private usersRep:UsersRepository) {}

	public async addFriend(user:User, friendId:string) {
		let friend = await this.usersRep.getById(friendId);

		if (friend !== null) {
			if (!user.user_friends.includes(friendId) && !friend.user_friends.includes(user._id.toString())) {
				user.user_friends.push(friendId);
				friend.user_friends.push(user._id.toString());
				await this.usersRep.update(user);
				await this.usersRep.update(friend);
			}else {
				throw new Err('Can\'t add user');
			}
		}else {
			throw new Err('User not found!');
		}
	}

	public async removeFriend(user:User, friendId:string) {
		let friend = await this.usersRep.getById(friendId);

		if (friend !== null) {
			
		}else {
			throw new Err('User not found!');
		}
	}

	public async getFriendsList(user:User) {
		
	}

	public async getOnlineFriendsList(user:User) {
		return (await this.usersRep.getOnlineByIds(user.user_friends)).map(u => new Friend(u));
	}

	public async sendFriendRequest(user:User, friendId:string) {
		let friend = await this.usersRep.getById(friendId);
		if (friend !== null) {
			if (!user.user_friends.includes(friendId) && !friend.friends_requests.includes(user._id.toString())) {
				friend.friends_requests.push(user._id.toString());
				await this.usersRep.update(friend);
			}else {
				throw new Err('Can\'t send request');
			}
		}else {
			throw new Err('User not found!');
		}
	}

	public async getFriendsRequests(user:User):Promise<Array<Friend>> {
		let users = await this.usersRep.getByIds(user.friends_requests);
		return users.map(u => new Friend(u));
	}

	public async removeFriendRequest(user:User, friendId:string) {
		user.friends_requests = user.friends_requests.filter(id => id !== friendId);
		await this.usersRep.update(user);
	}

}