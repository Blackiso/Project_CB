import { injectable } from 'tsyringe';
import { Request, Response } from 'express';
import { Controller, Get, Post, Middleware } from '@overnightjs/core';
import { FriendsListService } from '../services';
import { Logger } from '@overnightjs/logger';
import { Err } from '../models';
import { AuthenticationMiddleware } from '../middleware';


@injectable()
@Controller('api/friends')
export class FriendsController {

	constructor(private friendsService:FriendsListService) {}

	@Post('requests/:userId/send')
	@Middleware(AuthenticationMiddleware)
	public async sendRequest(req:Request | any, res:Response) {
		try {

			let friendId = req.params.userId;
			if (friendId == req.user._id.toString()) throw new Err('Error sending request!');

			await this.friendsService.sendFriendRequest(req.user, friendId);
			return res.status(200).send();

		}catch(e) {
			Logger.Err(e.error || e);
			return res.status(e.code || 400).send(e);
		}
	}

	@Get('requests/list')
	@Middleware(AuthenticationMiddleware)
	public async listRequests(req:Request | any, res:Response) {
		try {
			
			let response = await this.friendsService.getFriendsRequests(req.user);
			return res.status(200).send(response);

		}catch(e) {
			Logger.Err(e.error || e);
			return res.status(e.code || 400).send(e);
		}
	}

	@Post('requests/:userId/respond')
	@Middleware(AuthenticationMiddleware)
	public async respondToRequest(req:Request | any, res:Response) {
		try {
			
			let friendId = req.params.userId;
			let accept = req.body.accept;

			if (accept) await this.friendsService.addFriend(req.user, friendId);
			this.friendsService.removeFriendRequest(req.user, friendId);

			return res.status(200).send();

		}catch(e) {
			Logger.Err(e.error || e);
			return res.status(e.code || 400).send(e);
		}
	}

}