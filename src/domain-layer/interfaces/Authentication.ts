export interface Authentication {

	register(username:string, email:string, password:string):Promise<string>;
	login(username:string, password:string):Promise<string>;
	// authenticate();
	// logout();

}