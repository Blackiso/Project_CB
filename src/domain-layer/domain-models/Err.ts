export class Err extends Error {
	error:string;
	code:number;

	constructor(error:string, code?:number) {
		super();
		this.error = error;
		this.code = code || 400;
	}
}