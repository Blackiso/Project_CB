export interface EventHandler {
	run(socket:any, data:any):void;
}