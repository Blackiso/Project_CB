import { injectable } from 'tsyringe';
import { Request, Response } from 'express';
import { Controller, Get, Post, Middleware } from '@overnightjs/core';
import { AuthenticationMiddleware } from '../middleware';
import { Logger } from '@overnightjs/logger';
import { RoomsService } from '../services';
import { roomCreateValidator, joinRoomValidator } from '../lib/validators';
import { Err, Room, RoomResponse, RoomDetailsAdv, RoomDetails } from '../models';


@injectable()
@Controller('api/rooms')
export class RoomsController {
	
	constructor(private roomsService:RoomsService) {}

	@Post('create')
	@Middleware(AuthenticationMiddleware)
	public async createRoom(req:Request | any, res:Response) {

		try {

			if (!roomCreateValidator(req.body)) throw new Err("Bad Request!");

			let room = await this.roomsService.create(req.user, req.body.name, { privacy: req.body.privacy }, req.body.sid);
			let response = new RoomDetailsAdv(room);
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

			let room = await this.roomsService.join(req.user, req.body.room, req.body.sid);
			let response = room.room_owner._id == req.user._id.toString() ? new RoomDetailsAdv(room) : new RoomDetails(room);
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

			let rooms = await this.roomsService.list(req.user, req.query.type);
			let response = rooms.map(room => new RoomResponse(room));
			return res.status(200).send(response);

		}catch(e) {
			Logger.Err(e.error || e);
			return res.status(e.code || 400).send(e);
		}

	}

}