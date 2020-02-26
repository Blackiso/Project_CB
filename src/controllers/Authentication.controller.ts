import { Request, Response } from 'express';
import { injectable } from "tsyringe";
import { Controller, Get, Post, Middleware } from '@overnightjs/core';
import { AuthenticationService } from '../services';
import { Logger } from '@overnightjs/logger';
import { registerUserValidator, loginUserValidator } from '../util';
import { Err, JWTResponse, AuthenticateResponse } from '../models';
import { AuthenticationMiddleware } from '../middleware';


@injectable()
@Controller('api/authentication')
export class AuthenticationController {

	constructor(private authService:AuthenticationService) {}

	@Post('register')
	private async register(req:Request, res:Response) {

		try {
			if (!registerUserValidator(req.body)) throw new Err("Bad Request!");

			let token = await this.authService.registerUser(req);
			let response = new JWTResponse(token);

			return res.status(200).send(response);
		}catch(e) {
			Logger.Err(e.error || e);
			return res.status(400).send(e);
		}

	}

	@Post('login')
	private async login(req:Request, res:Response) {

		try {
			if (!loginUserValidator(req.body)) throw new Err("Bad Request!");

			let token = await this.authService.loginUser(req.body);
			let response = new JWTResponse(token);

			return res.status(200).send(response);
		}catch(e) {
			Logger.Err(e.error || e);
			return res.status(400).send(e);
		}

	}

	@Get('authenticate')
	@Middleware(AuthenticationMiddleware)
	private autheticate(req:Request | any, res:Response) {
		return res.status(200).send(new AuthenticateResponse(req.user));
	}


	//For testing..
	@Get('')
	@Middleware(AuthenticationMiddleware)
	private get(req:Request, res:Response) { 
		return res.status(200).send();
	}
}