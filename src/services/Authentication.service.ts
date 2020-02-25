import { Database } from '../util/Database';
import { injectable } from "tsyringe";

@injectable()
export class AuthenticationService {
	
	constructor(private database:Database) {
		
	}

	public getMsg():Promise<string> {
		return this.database.insert('xx', 'aa', 'bb', 'ccc').then((x) => {
			console.log('resolved');
			return x;
		});
	}
}