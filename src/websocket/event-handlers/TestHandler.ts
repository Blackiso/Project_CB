import { EventHandler } from '../../interfaces';

export class TestHandler implements EventHandler {
	
	constructor() {}

	run(socket, data) {
		console.log(data);
	}
}