export interface AuthenticationApi {

	register(username:string, email:string, password:string):Promise<string>;
	login(username:string, password:string):Promise<string>;
	authenticate(token:any):Promise<any>;
	// logout();

}