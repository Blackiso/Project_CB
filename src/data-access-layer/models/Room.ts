export class Room {
 	
 	_id:string;
 	room_name:string;
 	room_owner:any = {
 		_id: null,
 		username: null,
 		user_image: null
 	};
 	room_options:any = {
 		privacy: "",
 		language_filter: false,
 		allow_invites: true
 	};
 	room_mods:Array<string>;
 	room_users:Array<string>;
 	room_banned:Array<string>;
 	invited_users:Array<object>;
 	online_users:number;

}