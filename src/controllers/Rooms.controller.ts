import { injectable } from 'tsyringe';
import { Request, Response } from 'express';
import { Controller, Get, Post, Middleware } from '@overnightjs/core';
import { AuthenticationMiddleware } from '../middleware';
import { Logger } from '@overnightjs/logger';
import { RoomsService } from '../domain-layer/services';
import { roomCreateValidator, joinRoomValidator } from '../validators/Validators';
import { RoomResponse, UserResponse } from '../response-models';
import { Err } from '../domain-layer/domain-models';
import { Room } from '../data-access-layer/models';


@injectable()
@Controller('api/rooms')
export class RoomsController {
	
	constructor(private roomsService:RoomsService) {}

	@Post('create')
	@Middleware(AuthenticationMiddleware)
	public async createRoom(req:Request | any, res:Response) {

		try {

			if (!roomCreateValidator(req.body)) throw new Err("Bad Request!");

			let response = await this.roomsService.createRoom(req.user, req.body) as Room;
			return res.status(200).send(response);

		}catch(e) {
			Logger.Err(e.error || e);
			return res.status(e.code || 400).send(e);
		}
		
	}

	@Post('join')
	@Middleware(AuthenticationMiddleware)
	public async joinRoom(req:Request | any, res:Response) {

		try {

			if (!joinRoomValidator(req.body)) throw new Err("Bad Request!");

			let response = await this.roomsService.joinRoom(req.user, req.body.room, req.body.sid);
			return res.status(200).send(response);

		}catch(e) {
			Logger.Err(e.error || e);
			return res.status(e.code || 400).send(e);
		}
		
	}

	@Get('list')
	@Middleware(AuthenticationMiddleware)
	public async joinedRooms(req:Request | any, res:Response) {

		try {

			let response = await this.roomsService.listRooms(req.user, req.query.type);
			return res.status(200).send(response);

		}catch(e) {
			Logger.Err(e.error || e);
			return res.status(e.code || 400).send(e);
		}

	}

}