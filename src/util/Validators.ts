import { objHasPropertys } from './Util';
import { Err } from '../models';

export let registerUserValidator = (obj):boolean => {
	let mustHave = ['username', 'email', 'password'];
	let check = objHasPropertys(obj, mustHave);
	if (obj.username.length > 15 || obj.username.length < 5) throw new Err("Invalid username!");
	if (!emailValidator(obj.email)) throw new Err("Invalid email!");
	if (!passwordValidator(obj.password)) throw new Err("Invalid password!");

	return check;
};

export let emailValidator = (email:string):boolean => {
	return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
};

export let passwordValidator = (password:string):boolean => {
	return /^(?=.*[A-Za-z])(?=.*[0-9])[A-Za-z\d@$!%*#?é^&â ]{5,20}$/.test(password);
};