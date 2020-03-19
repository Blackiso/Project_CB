import { injectable } from "tsyringe";
import { Database, ModelMapper } from '../util';
import { User, Err, Room } from '../models';
import { Logger } from '@overnightjs/logger';


@injectable()
export class RoomsDao {
	
	private insertQr:string = "INSERT INTO rooms VALUES (?,?,?,?)";
	private selectByIdQr:string = "SELECT * FROM rooms WHERE room_id=?";
	private selectAdmin:string = "SELECT room_owner FROM rooms WHERE room_id=?";

	constructor(private db:Database) {}

	public saveRoom(room:Room):Promise<any> {
		return this.db.insert(this.insertQr, room.room_id, room.room_owner, room.room_privacy, room.room_desc);
	}

	public getById(id):Promise<Room> {
		return new Promise((resolve, reject) => {
			this.db.select(this.selectByIdQr, id)
				.then(data => {
					if (data.length == 0) {
						reject(new Err("Room not found!"));
					}else {
						resolve(<Room>data[0]);
					}
				})
				.catch(e => {
					reject(e);
				});
		});
	}

	public async checkRoom(id):Promise<boolean> {
		let result = await this.db.select(this.selectByIdQr, id);
		if (result.length == 0) {
		 	throw new Err("Room dosen't exist!");
		}else {
			return true;
		}
	}

	public async roomExist(id):Promise<boolean> {
		let result = await this.db.select(this.selectByIdQr, id);
		if (result.length == 0) {
		 	return true
		}else {
			throw new Err("Room already exist!");	
		}
	}

	public getRoomAdmin(room):Promise<any> {
		return this.db.select(this.selectAdmin, room);
	}

}