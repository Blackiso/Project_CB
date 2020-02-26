import bcrypt  from 'bcrypt';
import { Err } from '../models';

export let objHasPropertys = (obj, props:Array<string>) => {
	let check = false;
	props.forEach(pr => {
		for (let prop in obj) {
			if (prop === pr) {
				check = true;
				break;
			}else {
				check = false;
			}
		}
	});
	return check;
}

export let passwordHash = (password:string):string => {
	return bcrypt.hashSync(password, 10);
};

export let generateKey = ():string => {
	return bcrypt.genSaltSync(25);
}

export let checkPasswordHash = (str:string, hash:string):boolean => {
	return bcrypt.compareSync(str, hash);
}

export let ModelMapper = (data:any, object:object) => {
	for (let key in data) {
		object[key] = data[key];
	}
	return object;
}