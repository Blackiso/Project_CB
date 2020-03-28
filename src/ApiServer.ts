import * as bodyParser from 'body-parser';
import { Server } from '@overnightjs/core';
import * as controllers from './controllers';
import { container } from "tsyringe";
import { Logger } from '@overnightjs/logger';
import useragent from 'express-useragent';
import { JwtMiddleware } from './middleware';
import { MongoDb } from './util';

//dev only
import cors from 'cors';

export class ApiServer extends Server {

	constructor() {
        super();

        let db = new MongoDb();

        this.app.use(cors());

        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({extended: true}));
        this.app.use(useragent.express());
        this.app.use(JwtMiddleware);

        this.setupControllers();
	}

	private setupControllers():void {
        const ctlrInstances = [];
        for (const name in controllers) {
            if (controllers.hasOwnProperty(name)) {
                const controller = (controllers as any)[name];
                Logger.Info('Init '+name);
                ctlrInstances.push(container.resolve(controller));
            }
        }
        super.addControllers(ctlrInstances);
    }

    get express() {
        return this.app;
    }

    public run(port:number):void {
        this.app.listen(port, () => {
            Logger.Info('Server started listening on port '+port);
        });
    }
}