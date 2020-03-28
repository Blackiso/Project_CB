export class Room {
 	
 	_id:string;
 	room_name:string;
 	room_owner = {
 		_id: "",
 		username: "",
 		user_image: ""
 	};
 	room_options = {
 		privacy: "",
 		language_filter: false,
 		allow_invites: true
 	};
 	room_mods:Array<string>;
 	room_users:Array<string>;
 	room_banned:Array<string>;
 	invited_users:Array<object>;

}