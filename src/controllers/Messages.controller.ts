import { injectable } from 'tsyringe';
import { Request, Response } from 'express';
import { Controller, Get, Post, Middleware } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';
import { messageValidator } from '../lib/validators';
import { Err } from '../models';
import { AuthenticationMiddleware } from '../middleware';
import { MessagesService } from '../services';


@injectable()
@Controller('api/room')
export class MessagesController {

	constructor(private msgService:MessagesService) {}

	@Get(':room/messages/list')
	@Middleware(AuthenticationMiddleware)
	public async getMessages(req:Request | any, res:Response) {

		try {
			let messages = await this.msgService.listMessages(req.params.room, req.user);
			return res.status(200).send(messages);
		}catch(e) {
			Logger.Err(e.error || e);
			return res.status(e.code || 400).send(e);
		}

	}

	@Post(':room/messages')
	@Middleware(AuthenticationMiddleware)
	public async postMessage(req:Request | any, res:Response) {

		try {

			if (!messageValidator(req.body)) throw new Err("Bad Request!");

			let message = await this.msgService.newMessage(req.params.room, req.user, req.body.msg);
			return res.status(200).send('');

		}catch(e) {
			Logger.Err(e.error || e);
			return res.status(e.code || 400).send(e);
		}

	}

}