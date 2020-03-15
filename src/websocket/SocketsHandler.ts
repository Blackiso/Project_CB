import { Logger } from '@overnightjs/logger';

//Bind users to sockets and catch events from socket and invoke dispatcher

export class SocketsHandler {

	private sockets:any = [];
	
	constructor() {}

	addSocket(socket) {
		// if (!this.sockets[namespace]) this.sockets[namespace] = [];

		socket.on('disconnect', this.disconnected.bind(this, socket));
		socket.on('INFO', this.event.bind(this, socket, 'INFO'));
		socket.on('MESG', this.event.bind(this, socket, 'MESG'));
		socket.on('ERRO', this.event.bind(this, socket, 'ERRO'));

		// let obj = {
		// 	socket: socket,
		// 	namespace: namespace
		// }

		// this.sockets[namespace].push(obj);
		this.sockets.push(socket);
	}

	removeSocket(socket) {
		let index = this.sockets.indexOf(socket);
		this.sockets.splice(index, 1);
	}

	disconnected(socket) {
		Logger.Info('Client Disconnected!');
		this.removeSocket(socket);
	}

	event(socket, event, msg) {
		Logger.Info('New message!');
		console.log(event, msg);
		socket.emit(event, msg);
	}

}