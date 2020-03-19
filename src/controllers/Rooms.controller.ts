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
			let response = await this.roomsService.createRoom(req.user, req.body) as Room;
			let roomResponse = new RoomResponse();
			let user = {
				user_id: req.user.user_id,
				username: req.user.username
			};
			roomResponse.room_admin = user;
			roomResponse.room_id = response.room_id;
			roomResponse.room_privacy = response.room_privacy;
			roomResponse.room_desc = response.room_desc;
			roomResponse.room_mods = [];
			
			// this.roomsService.joinRoom(req.user, response.room_id);

			return res.status(200).send(roomResponse);

		}catch(e) {
			Logger.Err(e.error || e);
			return res.status(400).send(e);
		}
		
	}

	@Post('join')
	@Middleware(AuthenticationMiddleware)
	public async joinRoom(req:Request | any, res:Response) {

		try {

			if (!joinRoomValidator(req.body)) throw new Err("Bad Request!");
			let user =  <UserResponse> ModelMapper(req.user, new UserResponse);
			await this.roomsService.joinRoom(user, req.body.room, req.body.sid);

			return res.status(200).send();

		}catch(e) {
			Logger.Err(e.error || e);
			return res.status(400).send(e);
		}
		
	}

}