import { singleton, injectable } from 'tsyringe';
import { Logger } from '@overnightjs/logger';
import { User,Err } from '../models';
import { RedisClient } from '../util/RedisClient';

@singleton()
@injectable()
export class SocketsHandler {
	
	private _mainSocket:any;

	constructor(private redis:RedisClient) {}

	set mainSocket(m) {
		this._mainSocket = m;
	}

	addSocket(socket:SocketIO.Socket | any) {
		this.redis.addStringToList(socket.user.user_id, socket.id).then(Logger.Info).catch(Logger.Err);
	}

	removeSocket(socket:SocketIO.Socket | any) {
		this.redis.removeFromList(socket.user.user_id, socket.id).then(Logger.Info).catch(Logger.Err);
	}

	sendToRoom(type, message, room) {
		this._mainSocket.to(room).emit(type, message);
	}

	sendToAll(type, message) {
		this._mainSocket.emit(type, message);
	}

	sendToSocket(event, message, uid) {
		this.redis.getAllList(uid).then(
			sockets => {
				console.log(sockets);
				sockets.forEach(socketId => {
					this._mainSocket.of('/').connected[socketId].emit(event, message);
				});
			},
			Logger.Err
		);
	}

	addSocketToRoom(sid, room, uid) {
		return new Promise((resolve, reject) => {
			this.redis.getAllList(uid).then(
				sockets => {
					let found = false;
					
					sockets.forEach(socketId => {
						if (socketId == sid) {
							this._mainSocket.of('/').connected[socketId].join(room);
							found = true;
							resolve();
						}
					});
					if (sockets.length == 0 || !found) reject(new Err('Socket not connected!'));
				},
				reject
			);
		});
	}

}