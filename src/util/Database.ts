import mysql  from 'mysql';
import { singleton } from "tsyringe";
import { Logger } from '@overnightjs/logger';
import { Err } from '../models';

@singleton()
export class Database {
	
	private HOST:string = "127.0.0.1";
	private USER:string = "black";
	private PASS:string = "";
	private DATA:string = "project_cb";

	private connection:any;

	constructor() {
		this.connection = mysql.createConnection({
			host: this.HOST,
			user: this.USER,
			password: this.PASS,
			database: this.DATA
		});

		this.connection.connect((err) => {
			if (err) {
				Logger.Err(err);
				return;
			}
			Logger.Info('Database connected!');
		});
	}

	public insert(statement:string, ...args:any):Promise<any> {
		let query = this.prepareQuery(statement, args);
		
		Logger.Imp(query);

		return new Promise((resolve, error) => {
			this.connection.query(query, (err, results) => {
				if (err) {
					error(new Err(err.sqlMessage, err.errno));
				}else {
					resolve(true);
				}
			});
		});
	}

	public select(statement:string, ...args:any):Promise<any> {
		let query = this.prepareQuery(statement, args);
		
		Logger.Imp(query);

		return new Promise((resolve, error) => {
			this.connection.query(query, (err, results) => {
				if (err) {
					error(new Err(err.sqlMessage, err.errno));
				}else {
					resolve(results);
				}
			});
		});
	}

	private prepareQuery(qr:string, args:Array<string>) {
		args.forEach(arg => {
			qr = qr.replace('?', "'"+this.mysql_real_escape_string(arg)+"'");
		});
		return qr;
	}

	private closeConnection() {
		this.connection.end();
	}

	private mysql_real_escape_string(x:string) {
	    return x;
	}
}