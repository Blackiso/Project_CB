export interface MessagesApi<U, M> {
	save(roomId:string, user:U, msg:string):Promise<M>;
	list(roomId:string, user:U):Promise<M[]>;
	delete(roomId:string, user:U, messageId:string):void;
}