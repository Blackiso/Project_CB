import { injectable, singleton } from 'tsyringe'
import * as http from 'http';
import io = require('socket.io');
import { Logger } from '@overnightjs/logger';
import { Dispatcher } from './Dispatcher';
import { AuthenticationWSMiddleware, eventWildCard, socketId } from '../middleware';
import { SocketsHandler } from './SocketsHandler';
import { RoomsService } from '../services/Rooms.service';
 
//Main socket that accepts new sockets

@injectable()
@singleton()
export class SocketServer {
	
	private app:any;
	private io:any;
	private port:number;

	constructor(private dispatcher:Dispatcher, private socketsHandler:SocketsHandler, private roomsService:RoomsService) {}

	init(server) {
		this.io = io(server);
		Logger.Info('Websocket server started');

		this.io.use(AuthenticationWSMiddleware);
		this.io.use(socketId);
		this.io.use(eventWildCard);
		
		this.io.on('connection', this.connection.bind(this));
		this.socketsHandler.mainSocket = this.io;
	}

	connection(socket:SocketIO.Socket | any) {
		Logger.Info('New connection from '+ socket.user.username);
		socket.on('*', (packet) => {
			
		});

		socket.on('disconnect', () => {
			this.dispatcher.handdleOuterEvents('disconnect', socket.id, socket.user);
		});

		this.dispatcher.handdleOuterEvents('connected', socket.user);
		this.socketsHandler.addSocket(socket);
	}

}