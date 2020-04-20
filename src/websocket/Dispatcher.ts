import { singleton, injectable } from 'tsyringe';
import { RoomsService } from '../services';
import { EventEmitter } from 'events';
import { SocketsHandler } from './SocketsHandler';
import { Logger } from '@overnightjs/logger';


@injectable()
@singleton()
export class Dispatcher {
	
	constructor(private roomsService:RoomsService, private ws:SocketsHandler) {
		this.handdleInnerEvents();
	}

	handdleInnerEvents() {
		this.roomsService.events.on('users_update', (message, roomName) => {
			if (message !== null) this.ws.sendToRoom('INFO', message, roomName);
			this.roomsService.getOnline(roomName)
				.then(users => {
					this.ws.sendToRoom('USERS', users, roomName);
				})
				.catch(Logger.Err);
		});

		this.roomsService.events.on('socket_left_room', (sid, userId, roomName) => {
			this.ws.removeSocketFromRoom(sid, roomName, userId);
		});

		this.roomsService.events.on('socket_joined_room', (sid, userId, roomName) => {
			this.ws.addSocketToRoom(sid, roomName, userId);
		});
	}

	handdleOuterEvents(type, ...values) {
		switch (type) {
			case 'disconnect':
				let sid = values[0];
				let user = values[1];

				this.roomsService.disconnect(user, sid)
					.then(x => {
						Logger.Info(user.username+"["+sid+"] disconnected");
						this.ws.removeSocket(user, sid);
					}).catch(Logger.Err);
				break;
			
			default:
				// code...
				break;
		}
	}

}