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
			roomResponse.room_owner = user;
			roomResponse.room_id = response.room_id;
			roomResponse.room_privacy = response.room_privacy;
			roomResponse.room_desc = response.room_desc;
			roomResponse.room_mods = [];

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
			let { user_id, username } = req.user;
			let user =  <UserResponse> ModelMapper({ user_id, username }, new UserResponse());
			await this.roomsService.joinRoom(user, req.body.room, req.body.sid);
			Logger.Info(user.username+' joined '+req.body.room);
			return res.status(200).send();

		}catch(e) {
			Logger.Err(e.error || e);
			return res.status(400).send(e);
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
			return res.status(400).send(e);
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
			return res.status(400).send(e);
		}

	}

}