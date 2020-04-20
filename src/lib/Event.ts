import { EventEmitter } from 'events';

export class Event extends EventEmitter {
	
	subscribe(func:any) {
		this.on('data', func);
	}

	next(...values) {
		this.emit('data', ...values);
	}
	
}