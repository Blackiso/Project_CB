import { TestHandler } from './event-handlers';
import { EventHandler } from '../interfaces';

export class Dispatcher {
	
	private handlers = [
		{
			event: 'MESG',
			handler: TestHandler
		}
	]

	constructor() {}

	dispatch(socket, event, data) {
		let handler = this.gethandler(event);
		if (handler !== null) {
			handler.run(socket, data);
		}
	}

	gethandler(event):EventHandler | null {
		for (let i = 0; i < this.handlers.length; i++) {
			let hn = this.handlers[i];
			if (hn.event == event) {
				return new hn.handler();
			}
		}
		return null;
	}
}