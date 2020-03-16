import { singleton } from 'tsyringe';
import { Logger } from '@overnightjs/logger';
import { User } from '../../models';

@singleton()
export class Emitter {
	
	private _mainSocket:any;
	private _clients:any = {};

	constructor() {}

	set mainSocket(m) {
		this._mainSocket = m;
	}

	getRoomUsers(room) {
		let users = [];

		if (this._mainSocket.nsps['/'].adapter.rooms[room] !== undefined) {
			let roomSockets = this._mainSocket.nsps['/'].adapter.rooms[room].sockets;
			for (let key in roomSockets) {
				let x = {};
				let user = this._mainSocket.sockets.connected[key].user;

				x['user_id'] = user.user_id;
				x['username'] = user.username;
				x['user_email'] = user.user_email;
				users.push(x);
			}
		}
		
		return users;
	}

	sendToAll(type, message) {
		this._mainSocket.emit(type, message);
	}

	sendToSocket(type, message, user_id) {
		this._clients[user_id].forEach(socket => {
			socket.emit(type, message);
		});
	}

	sendToRoom(type, message, room) {
		this._mainSocket.to(room).emit(type, message);
	}

	addSocketToRoom(user:User, room) {
		let onlineSockets = this.getRoomUsers(room);
		this._clients[user.user_id].forEach(socket => {
			socket.join(room);

			if (!socket.im_in_rooms) socket.im_in_rooms = [];
			socket.im_in_rooms.push(room);

			this.sendToSocket('test', onlineSockets, user.user_id);
		});
		this.sendToRoom('test', user.username+' joined '+room, room);
	}

	removeSocket(socket:SocketIO.Socket | any) {
		this._clients[socket.user.user_id].forEach((s, i) => {
			if (socket.id == s.id) delete this._clients[socket.user.user_id][i];
		});

		if (socket.im_in_rooms) {
			socket.im_in_rooms.forEach(room => {
				this.sendToRoom('test', socket.user.username+' left '+room, room);
			});
		}
	}

	addSocket(socket:SocketIO.Socket | any) {
		if (!this._clients[socket.user.user_id]) {
			this._clients[socket.user.user_id] = [];
		}
		this._clients[socket.user.user_id].push(socket);
	}

}