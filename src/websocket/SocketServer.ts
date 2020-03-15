import { injectable, singleton } from "tsyringe"
import * as http from 'http';
import io = require('socket.io');
import { Logger } from '@overnightjs/logger';
import { Dispatcher } from './Dispatcher';
import { AuthenticationWSMiddleware, eventWildCard } from '../middleware';
 
//Main socket that accepts new sockets

@injectable()
@singleton()
export class SocketServer {
	
	private app:any;
	private io:any;
	private port:number;

	constructor(private dispatcher:Dispatcher) {}

	init(server) {
		this.io = io(server);
		Logger.Info('Websocket server started');
		this.io.use(AuthenticationWSMiddleware);
		this.io.use(eventWildCard);
		this.io.on('connection', this.newClient.bind(this));
	}

	newClient(socket) {
		Logger.Info('New connection from '+ socket.user.username);
		socket.on('*', (packet) => {
			this.dispatcher.dispatch(socket, packet.data[0], packet.data[1]);
		});
		socket.on('disconnect', () => {
			Logger.Info(socket.user.username+" disconnected");
		});
	}

	test() {
		this.io.emit('test', 'hi');
	}

}