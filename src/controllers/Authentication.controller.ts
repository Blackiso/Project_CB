import { Request, Response } from 'express';
import { injectable } from "tsyringe";
import { Controller, Get, Post } from '@overnightjs/core';
import { AuthenticationService } from '../services';
import { Logger } from '@overnightjs/logger';
import { registerUserValidator } from '../util';
import { Err, JWTResponse } from '../models';


@injectable()
@Controller('api/authentication')
export class AuthenticationController {

	constructor(private authService:AuthenticationService) {}

	@Post('register')
	private async register(req:Request, res:Response) {

		try {
			console.log(req.body);
			if (!registerUserValidator(req.body)) throw new Err("Bad Request!");

			let token = await this.authService.registerUser(req);
			let response = new JWTResponse(token);

			return res.status(200).send(response);
		}catch(e) {
			Logger.Err(e.error || e);
			return res.status(400).send(e);
		}

	}


	@Get('')
	private get(req:Request, res:Response) {
		return res.status(200).send("");
	}
}