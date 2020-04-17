export class JWTResponse {
	
	token:string;
	type:string = "Bearer";

	constructor(token:string) {
		this.token = token;
	}

}