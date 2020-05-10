import { injectable } from 'tsyringe';
import { Request, Response } from 'express';
import { Controller, Get, Post, Patch, Delete, Middleware } from '@overnightjs/core';
import { AuthenticationMiddleware } from '../middleware';
import { Logger } from '@overnightjs/logger';
import { RoomsService, MessagesService } from '../services';
import { roomCreateValidator, joinRoomValidator, updateRoomValidator } from '../lib/validators';
import { Err, IRoom, RoomResponse, RoomDetailsAdv, RoomDetails } from '../models';


@injectable()
@Controller('api/rooms')
export class RoomsController {
	
	constructor(private roomsService:RoomsService, private messagesService:MessagesService) {}

	@Post('create')
	@Middleware(AuthenticationMiddleware)
	public async createRoom(req:Request | any, res:Response) {

		try {

			if (!roomCreateValidator(req.body)) throw new Err("Bad Request!");

			let room = await this.roomsService.createRoom(req.user, req.body.name, { privacy: req.body.privacy });
			let response = new RoomDetailsAdv(room, req.user);

			return res.status(200).send(response);

		}catch(e) {
			console.log(e);
			Logger.Err(e.error || e);
			return res.status(e.code || 400).send(e);
		}
		
	}

	@Get('list')
	@Middleware(AuthenticationMiddleware)
	public async getRooms(req:Request | any, res:Response) {

		try {

			let listType = req.query.type;
			let roomsList;

			switch (listType) {
				case 'owned':
					roomsList = await this.roomsService.getOwnedRooms(req.user);
					break;
				case 'public':
					roomsList = await this.roomsService.getPublicRooms();
					break;
				default:
					roomsList = await this.roomsService.getJoinedRooms(req.user);
					break;
			}

			let response = roomsList.map(room => new RoomResponse(room));
			return res.status(200).send(response);

		}catch(e) {
			Logger.Err(e.error || e);
			return res.status(e.code || 400).send(e);
		}

	}

	@Get(':roomName')
	@Middleware(AuthenticationMiddleware)
	public async room(req:Request | any, res:Response) {

		try {

			let room = await this.roomsService.getRoom(req.user, req.params.roomName, 'name');
			let response = req.user.can_operate(room) ? new RoomDetailsAdv(room, req.user) : new RoomDetails(room, req.user);
			return res.status(200).send(response);

		}catch(e) {
			Logger.Err(e.error || e);
			return res.status(e.code || 400).send(e);
		}
		
	}

	@Delete(':roomId/delete')
	@Middleware(AuthenticationMiddleware)
	public async delete(req:Request | any, res:Response) {

		try {
			let room = await this.roomsService.getRoom(req.user, req.params.roomId);
			let response = await this.roomsService.deleteRoom(req.user, room);
			await this.messagesService.deleteAllRoomMessages(room);

			Logger.Info('Delete room '+ room.room_name);
			return res.status(200).send();

		}catch(e) {
			Logger.Err(e.error || e);
			return res.status(e.code || 400).send(e);
		}

	}

	/*@Post('join')
	@Middleware(AuthenticationMiddleware)
	public async joinRoom(req:Request | any, res:Response) {

		try {

			if (!joinRoomValidator(req.body)) throw new Err("Bad Request!");

			let room = await this.roomsService.join(req.user, req.body.room, req.body.sid);
			let is_mod = room.room_mods.includes(req.user._id);
			let is_admin = room.room_owner._id.toString() == req.user._id.toString();
			let response = room.room_owner._id == req.user._id.toString() ? new RoomDetailsAdv(room, is_mod, is_admin) : new RoomDetails(room, is_mod, is_admin);
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

	@Post(':roomId/users/:id/mod')
	@Middleware(AuthenticationMiddleware)
	public async moderators(req:Request | any, res:Response) {

		try {

			let roomId = req.params.roomId;
			let userId = req.params.id;

			await this.roomsService.roomModerator(req.user, userId, roomId);
			return res.status(200).send();

		}catch(e) {
			Logger.Err(e.error || e);
			return res.status(e.code || 400).send(e);
		}

	}

	@Post(':roomId/users/:id/ban')
	@Middleware(AuthenticationMiddleware)
	public async ban(req:Request | any, res:Response) {

		try {

			let roomId = req.params.roomId;
			let userId = req.params.id;

			await this.roomsService.banUserFromRoom(req.user, userId, roomId);
			return res.status(200).send();

		}catch(e) {
			Logger.Err(e.error || e);
			return res.status(e.code || 400).send(e);
		}

	}

	@Get(':roomId/banned')
	@Middleware(AuthenticationMiddleware)
	public async getBanned(req:Request | any, res:Response) {

		try {

			let roomId = req.params.roomId;

			let response = await this.roomsService.getBanned(req.user, roomId);
			return res.status(200).send(response);

		}catch(e) {
			Logger.Err(e.error || e);
			return res.status(e.code || 400).send(e);
		}

	}

	@Patch(':roomId/update')
	@Middleware(AuthenticationMiddleware)
	public async update(req:Request | any, res:Response) {

		try {

			if (!updateRoomValidator(req.body)) throw new Err("Bad Request!");

			let roomId = req.params.roomId;
			let response = await this.roomsService.updateOptions(req.user, roomId, req.body);
			return res.status(200).send();

		}catch(e) {
			Logger.Err(e.error || e);
			return res.status(e.code || 400).send(e);
		}

	}*/

}