import { container } from "tsyringe";
import { AuthenticationService } from '../services';
import { Logger } from '@overnightjs/logger';
import { EventEmitter } from 'events';
import { JWT } from '../lib';
import { Err } from '../models';
import { Request } from 'express';



export let AuthenticationMiddleware = async (req:any, res:any, next:any) => {
	try {
		let authService =  container.resolve(AuthenticationService);
		let user = await authService.authenticate(req.token);
		req.user = user;
		next();
	}catch(e) {
		Logger.Err(e.error || e);
		return res.status(401).send(new Err("Unautorized request!", 401));
	}
}

export let AuthenticationWSMiddleware = async (socket, next:any) => {
	Logger.Info('Trying to authenticate socket');
	try {

		if (socket.handshake.query && socket.handshake.query.token) {
			Logger.Info('Token found => '+ socket.handshake.query.token);

			let token = new JWT(socket.handshake.query.token);
			let authService =  container.resolve(AuthenticationService);
			let user = await authService.authenticate(token);

			socket.user = user;
			next();

		}else {
			Logger.Err('Token not found');
			throw new Err('Token not found');
		}

		
	}catch(e) {
		Logger.Err(e.error || 'Token Error');
		next(new Err('Authentication error'));
	}
}


export let JwtMiddleware = (req:any, res:any, next:any) => {
	try {
		if (!req.headers.authorization) throw 'No Auth Headers';
		let token = req.headers.authorization.replace('Bearer ', '');
		if (token.length < 10)  throw 'Token not found!';
		req.token = new JWT(token);
	}catch(e) {
		Logger.Warn(e);
		req.token = null;
	}

	next();
}

export let requestUrlLogger = (req:Request, res:any, next:any) => {
	Logger.Info(req.path);
	next();
}

export let eventWildCard = (socket, next:any) => {
	let emit = EventEmitter.prototype.emit;
	socket.onevent = function (packet) {
		var args = packet.data || []
		if (packet.id != null) {
		args.push(this.ack(packet.id))
		}
		emit.call(this, '*', packet)
		return emit.apply(this, args)
	}
	return next ? next() : null;
}

export let socketId = (socket, next) => {
	if (socket.user.user_id) {
		// socket.id = socket.user.user_id;
	}
	next();
}