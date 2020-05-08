import { Friend } from './persistence/Friend';

export class FriendsList {
	
	friendsList:Array<Friend> = [];

	constructor() {}

	push(friend:Friend) {
		this.friendsList.push(friend);
	}

	get list() {
		return this.friendsList;
	}

}