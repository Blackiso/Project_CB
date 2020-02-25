import mysql  from 'mysql';
import { singleton } from "tsyringe";
import { Logger } from '@overnightjs/logger';

@singleton()
export class Database {
	
	private HOST:string = "127.0.0.1";
	private USER:string = "black";
	private PASS:string = "";
	private DATA:string = "chatbts";

	private connection:any;

	constructor() {
		this.connection = mysql.createConnection({
			host: this.HOST,
			user: this.USER,
			password: this.PASS,
			database: this.DATA
		});

		this.connection.connect(() => {
			Logger.Info('Database connected!');
		});
	}

	public insert(statement:string, ...arg:any):Promise<any> {
		console.log(statement, arg);
		return new Promise((resolve, err) => {
			setTimeout(() => {
				console.log(this.USER);
				resolve(this.USER);
			}, 300);
		});
	}

	public select(statement:string, ...arg:any) {

	}

	public update(statement:string, ...arg:any) {

	}

	private closeConnection() {
		this.connection.end();
	}
}