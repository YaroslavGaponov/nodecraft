
const Pid = require('./pid');

const Info = new Array(256);

Info[Pid.keepalive] = 'packet:keepalive$token:Int;';
Info[Pid.login] = 'packet:login$eid:Int;level_type:Str;game_mode:Byte;dimension:Byte;difficalty:Byte;magic:Byte;max_player:Byte;';
Info[Pid.handshake] = 'packet:handshake$protocol_version:Byte;username:Str;server_address:Str;server_port:Int;';
Info[Pid.player] = 'packet:player$on_ground:Byte;';
Info[Pid.spawn_position] = 'packet:spawn_position$x:Int;y:Int;z:Int;';
Info[Pid.player_position] = 'packet:player_position$x:Double;y:Double;stance:Double;z:Double;';
Info[Pid.player_position_and_look] = 'packet:player_position_and_look$x:Double;stance:Double;y:Double;z:Double;yaw:Float;pitch:Float;on_ground:Byte;';
Info[Pid.map_chunk] = 'packet:map_chunk$x:SInt;z:SInt;solid:Byte;primary_bitmap:Short;add_bitmap:Short;data:Chunk;';

module.exports = Info;

