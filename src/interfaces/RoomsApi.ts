export interface RoomsApi<U, R> {

	create(user:U, name:string, options:any, sid:string):Promise<R>;
	join(user:U, room:any, sid:string):Promise<R>;
	list(user:U, type:string):Promise<Array<R>>;
	leave(user:U, roomName:string, sid:string):void;
	disconnect(user:U, sid:string):void;
	getOnline(roomName:string):Promise<Array<any>>;
	getBanned(user:U, roomId:string);
	roomModerator(user:U, userId:string, roomId:string);
	banUserFromRoom(user:U, userId:string, roomId:string);

}