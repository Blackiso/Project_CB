/*import { injectable } from "tsyringe";
import { Database, ModelMapper } from '../util';
import { User, Err, Room } from '../models';
import { Logger } from '@overnightjs/logger';


@injectable()
export class UsersRoomsDao {

	private insertQr:string = "INSERT INTO users_rooms (user_id, room_id) VALUES (?,?)";
	private deleteQr:string = "DELETE FROM users_rooms WHERE user_id = ? AND room_id = ?";
	private checkQr:string = "SELECT * FROM users_rooms WHERE user_id = ? AND room_id = ?";

	constructor(private db:Database) {}

	public save(user_id, room_id):Promise<any> {
		return this.db.insert(this.insertQr, user_id, room_id);
	}

	public delete(user_id, room_id):Promise<any> {
		return this.db.insert(this.deleteQr, user_id, room_id);
	}

	public check(user_id, room_id):Promise<boolean> {
		return new Promise((resolve, reject) => {
			this.db.select(this.checkQr, user_id, room_id).then(data => {
				if (data.length == 0) {
					resolve(false);
				}else {
					resolve(true);
				}
			}).catch(reject);
		});
	}

}
*/