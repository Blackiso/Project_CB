import bcrypt  from 'bcrypt';
import { Err } from '../models';
import crypto  from 'crypto';


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

export let generate24Bit = () => {
	let hash = crypto.randomBytes(12);
	return hash.toString('hex');
}

export let ModelMapper = (data:any, object:object) => {
	for (let key in data) {
		object[key] = data[key];
	}
	return object;
}

export let clearNullArray = (array) => {
	let a = [] as Array<any>;
	array.forEach(x => {
		if (x !== null) a.push(x);
	}); 
	return a;
}