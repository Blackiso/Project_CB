import * as bodyParser from 'body-parser';
import { Server } from '@overnightjs/core';
import * as controllers from './controllers';
import { container } from "tsyringe";
import { Logger } from '@overnightjs/logger';


export class ApiServer extends Server {

	constructor() {
		super();

		this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({extended: true}));
        this.setupControllers();
	}

	private setupControllers():void {
	 	const ctlrInstances = [];
        for (const name in controllers) {
            if (controllers.hasOwnProperty(name)) {
                const controller = (controllers as any)[name];
                Logger.Info('Init Controller => '+name);
                ctlrInstances.push(container.resolve(controller));
            }
        }
        super.addControllers(ctlrInstances);
    }


	public run(port:number):void {

		this.app.listen(port, () => {
			Logger.Info('Server started listening on port '+port);
		});

	}
}