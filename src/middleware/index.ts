import { container } from "tsyringe";
import { Authentication } from './Authentication';
import { Logger } from '@overnightjs/logger';
import { EventEmitter } from 'events';
import { JWT } from '../util';


export let AuthenticationMiddleware = (req:any, res:any, next:any) => {
	let auth =  container.resolve(Authentication);
	auth.authenticate(req, res, next);
}

export let AuthenticationWSMiddleware = (socket, next:any) => {
	let auth =  container.resolve(Authentication);
	auth.authenticateWS(socket, next);
}

export let JwtMiddleware = (req:any, res:any, next:any) => {
	if (req.headers.authorization) {
		req.jwt = new JWT(req.headers.authorization.replace('Bearer ', ''));
	}else {
		Logger.Warn("Token not found!");
		req.jwt = null;
	}
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