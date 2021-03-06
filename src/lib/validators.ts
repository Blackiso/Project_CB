import { objHasPropertys } from './common';
import { Err } from '../models';

export let registerUserValidator = (obj):boolean => {
	let mustHave = ['username', 'email', 'password'];
	let check = objHasPropertys(obj, mustHave);
	if (!nameValidator(obj.username)) throw new Err("Invalid username!");
	if (!emailValidator(obj.email)) throw new Err("Invalid email!");
	if (!passwordValidator(obj.password)) throw new Err("Invalid password!");

	return check;
};

export let loginUserValidator = (obj):boolean => {
	let mustHave = ['username', 'password'];
	return objHasPropertys(obj, mustHave);
};

export let roomCreateValidator = (obj):boolean => {
	let mustHave = ['name', 'privacy'];
	let check = objHasPropertys(obj, mustHave);
	if (!nameValidator(obj.name)) throw new Err("Invalid name!");
	if (obj.privacy !== "public" && obj.privacy !== "private") throw new Err("Invalid privacy!");
	
	return check;
}

export let joinRoomValidator = (obj):boolean => {
	let mustHave = ['room', 'sid'];
	let check = objHasPropertys(obj, mustHave);
	if (!nameValidator(obj.room)) throw new Err("Invalid name!");
	if (typeof obj.sid !== "string") throw new Err("Invalid socket!");
	
	return check;
}

export let messageValidator = (obj):boolean => {
	let mustHave = ['msg'];
	return objHasPropertys(obj, mustHave);
}

export let updateRoomValidator = (obj):boolean => {
	let mustHave = ['privacy', 'language_filter', 'allow_invites'];

	if (typeof obj.privacy !== 'undefined') {
		if (obj.privacy !== "public" && obj.privacy !== "private") throw new Err("Invalid privacy!");
	}
	if (typeof obj.language_filter !== 'undefined' && typeof obj.language_filter !== 'boolean') return false;
	if (typeof obj.allow_invites !== 'undefined' && typeof obj.allow_invites !== 'boolean') return false;

	console.log('passed');
	return objHasPropertys(obj, mustHave, true);
}

export let emailValidator = (email:string):boolean => {
	return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
};

export let passwordValidator = (password:string):boolean => {
	return /^(?=.*[A-Za-z])(?=.*[0-9])[A-Za-z\d@$!%*#?é^&â ]{5,20}$/.test(password);
};

export let nameValidator = (name:string):boolean => {
	return /^[a-zA-Z0-9_-]{3,15}$/.test(name);
}

