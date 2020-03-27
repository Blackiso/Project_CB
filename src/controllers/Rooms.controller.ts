import { injectable } from 'tsyringe';
import { Request, Response } from 'express';
import { Controller, Get, Post, Middleware } from '@overnightjs/core';
import { AuthenticationMiddleware } from '../middleware';
import { Logger } from '@overnightjs/logger';
import { RoomsService } from '../services';
import { roomCreateValidator, joinRoomValidator, ModelMapper } from '../util';
import { Err, Room, RoomResponse, UserResponse } from '../models';


@injectable()
@Controller('api/rooms')
export class RoomsController {
	
	constructor(private roomsService:RoomsService) {}

	@Post('create')
	@Middleware(AuthenticationMiddleware)
	public async createRoom(req:Request | any, res:Response) {

		try {

			if (!roomCreateValidator(req.body)) throw new Err("Bad Request!");

			let room = await this.roomsService.createRoom(req.user, req.body) as Room;
			let response = new RoomResponse(room);
			response.owner = req.user;
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

			await this.roomsService.joinRoom(req.user, req.body.room, req.body.sid);
			
			Logger.Info(req.user.username+' joined '+req.body.room);
			return res.status(200).send();

		}catch(e) {
			Logger.Err(e.error || e);
			return res.status(e.code || 400).send(e);
		}
		
	}

	@Get('details/:id')
	@Middleware(AuthenticationMiddleware)
	public async roomDetails(req:Request | any, res:Response) {

		try {

			let room = await this.roomsService.getRoomDetails(req.params.id);
			return res.status(200).send(room);

		}catch(e) {
			Logger.Err(e.error || e);
			return res.status(e.code || 400).send(e);
		}

	}

	@Get('joined')
	@Middleware(AuthenticationMiddleware)
	public async listJoinedRooms(req:Request | any, res:Response) {

		try {

			let rooms = await this.roomsService.getJoinedRooms(req.user.user_id);
			return res.status(200).send(rooms);

		}catch(e) {
			Logger.Err(e.error || e);
			return res.status(e.code || 400).send(e);
		}

	}

}