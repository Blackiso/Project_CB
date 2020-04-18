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
		this.redis.addStringToList('sockets-'+socket.user._id.toString(), socket.id).then(Logger.Info).catch(Logger.Err);
	}

	removeSocket(socket:SocketIO.Socket | any) {
		this.redis.removeFromList('sockets-'+socket.user._id.toString(), socket.id).then(Logger.Info).catch(Logger.Err);
	}

	sendToRoom(type, message, room) {
		this._mainSocket.to(room).emit(type, message);
	}

	sendToAll(type, message) {
		this._mainSocket.emit(type, message);
	}

	sendToSocket(event, message, uid) {
		this.redis.getAllList('sockets-'+uid).then(
			sockets => {
				sockets.forEach(socketId => {
					this._mainSocket.of('/').connected[socketId].emit(event, message);
				});
			},
			Logger.Err
		);
	}

	addSocketToRoom(sid, room, uid) {
		return new Promise((resolve, reject) => {
			this.checkSocketById(sid, uid).then(() => {
				this._mainSocket.of('/').connected[sid].join(room);
				resolve();
			}).catch(reject);
		});
	}

	removeSocketFromRoom(sid, room, uid) {
		this.checkSocketById(sid, uid).then(() => {
			this._mainSocket.of('/').connected[sid].leave(room);
		}).catch(Logger.Err);
	}

	checkSocketById(sid, uid) {
		return new Promise((resolve, reject) => {
			this.redis.getAllList('sockets-'+uid).then(
				sockets => {
					let found = false;
					
					sockets.forEach(socketId => {
						if (socketId == sid) {
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