import { injectable } from "tsyringe";
import { Database, ModelMapper } from '../util';
import { User, Err, Room } from '../models';
import { Logger } from '@overnightjs/logger';


@injectable()
export class RoomsDao {
	
	private insertQr:string = "INSERT INTO rooms VALUES (?,?,?,?)";
	private selectByIdQr:string = "SELECT * FROM rooms WHERE room_id=?";
	private selectAdmin:string = "SELECT room_owner FROM rooms WHERE room_id=?";
	private userRooms:string = "SELECT r.room_id, r.room_owner, r.room_privacy, r.room_desc FROM rooms AS r INNER JOIN users_rooms AS ur ON ur.room_id = r.room_id WHERE ur.user_id = ? ORDER BY ur.id DESC";

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
				.catch(reject);
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

	public async getRoomAdmin(room):Promise<any> {
		let room_owner = await this.db.select(this.selectAdmin, room);
		if (room_owner.length == 0) return new Err('Room admin not found!');
		return room_owner[0].room_owner;
	}

	public listUserRooms(user_id) {
		return this.db.select(this.userRooms, user_id);
	}

}