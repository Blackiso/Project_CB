import mongoose from 'mongoose';
import { Logger } from '@overnightjs/logger';

export class MongoDb {

	private url = 'mongodb://127.0.0.1:27017/project_db';
	private db;
	private reconnecting;
	
	constructor() {
		this.createConnection();
	}

	createConnection() {
		mongoose.connect(this.url, {useNewUrlParser: true, useUnifiedTopology: true});
		mongoose.set('useCreateIndex', true);
		this.db = mongoose.connection;

		//Add reconecting on error

		this.db.on('error', () => {
			Logger.Err('Error from MongoDB');
		});

		this.db.once('open', () => {
			Logger.Info('Connected successfully to MongoDB');
		});
	}

}