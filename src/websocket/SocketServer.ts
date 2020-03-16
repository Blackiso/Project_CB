import { injectable, singleton } from 'tsyringe'
import * as http from 'http';
import io = require('socket.io');
import { Logger } from '@overnightjs/logger';
import { Dispatcher } from './Dispatcher';
import { AuthenticationWSMiddleware, eventWildCard, socketId } from '../middleware';
import { Emitter } from './emitters/Emitter';
 
//Main socket that accepts new sockets

@injectable()
@singleton()
export class SocketServer {
	
	private app:any;
	private io:any;
	private port:number;

	constructor(private dispatcher:Dispatcher, private emitter:Emitter) {}

	init(server) {
		this.io = io(server);
		Logger.Info('Websocket server started');
		this.io.use(AuthenticationWSMiddleware);
		this.io.use(socketId);
		this.io.use(eventWildCard);
		this.io.on('connection', this.newClient.bind(this));
		this.emitter.mainSocket = this.io;
	}

	newClient(socket:SocketIO.Socket | any) {
		Logger.Info('New connection from '+ socket.user.username);
		socket.on('*', (packet) => {
			this.dispatcher.dispatch(socket, packet.data[0], packet.data[1]);
		});
		socket.on('disconnect', () => {
			Logger.Info(socket.user.username+" disconnected");
			this.emitter.removeSocket(socket);
		});
		this.emitter.addSocket(socket);
	}

}