export interface UserDetails<U> {

	save(user:U):Promise<U>;
	update(user:U):Promise<U>;
	detele(user:U):void;
	getById(id:string):Promise<U>;
	getByUsername(username:string):Promise<U>;
	getByEmail(email:string):Promise<U>;
	getMultipleById(ids:Array<string>):Promise<Array<U>>;

}