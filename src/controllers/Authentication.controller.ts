import { Request, Response } from 'express';
import { injectable } from "tsyringe";
import { Controller, Get, Post } from '@overnightjs/core';
import { AuthenticationService } from '../services/Authentication.service';
import { Database } from '../util/Database';


@injectable()
@Controller('api/authentication')
export class AuthenticationController {

	constructor(private authService:AuthenticationService, private database:Database) {}

	@Post('register')
	private register(req:Request, res:Response) {

	}


	@Get('')
	private async get(req:Request, res:Response) {
		let x = await this.authService.getMsg();
		return res.status(200).send(x);
	}
}