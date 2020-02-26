import { container } from "tsyringe";
import { Authentication } from './Authentication';
import { Logger } from '@overnightjs/logger';

export let AuthenticationMiddleware = (req:any, res:any, next:any) => {
	let auth =  container.resolve(Authentication);
	auth.authenticate(req, res, next);
}

export let JwtMiddleware = (req:any, res:any, next:any) => {
	if (req.headers.authorization) {
		req.jwt = req.headers.authorization.replace('Bearer ', '');
	}else {
		Logger.Warn("Token not found!");
		req.jwt = null;
	}
	next();
}