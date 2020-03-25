import { MongoClient } from 'mongodb';
import { Logger } from '@overnightjs/logger';
import { singleton } from 'tsyringe';

@singleton()
export class MongoDb {

	private url = 'mongodb://127.0.0.1:27017';
	private database = 'project_db';
	private client;
	private db;
	private reconnecting;
	
	constructor() {
		this.client = new MongoClient(this.url);
		this.createConnection();
	}

	createConnection() {
		this.client.connect((err) => {

			if (err) {
				Logger.Err(err);

				if (this.reconnecting == null) {
					this.reconnecting = setInterval(() => {
						this.createConnection();
					}, 3000);
				}
				
				return;
			}

			clearInterval(this.reconnecting);
			Logger.Info('Connected successfully to MongoDB');
			this.db = this.client.db(this.database);
			
		});
	}
}