This page presents a dissection of the current stable [Minecraft](http://minecraft.net/game/) protocol. The current pre-release protocol is documented [elsewhere](Pre-release_protocol.md). The protocol for Pocket Minecraft is substantially different, and is documented at [Pocket Minecraft Protocol](Pocket_Minecraft_Protocol).

If you're having trouble, check out the [FAQ](Protocol_FAQ) or ask for help in the IRC channel ([#mcdevs on irc.freenode.net](irc://irc.freenode.net/mcdevs)).

**Note**: While you may use the contents of this page without restriction to create servers, clients, bots, etc… you still need to provide attribution to #mcdevs if you copy any of the contents of this page for publication elsewhere.

       | Definition                               
-------| --------------------------------------------------------------------------------------
Player | When used in the singular, Player always refers to the client connected to the server
Entity | Entity refers to any item, player, mob, minecart or boat in the world. This definition is subject to change as Notch extends the protocol
EID    | An EID - or Entity ID - is a unique 4-byte integer used to identify a specific entity 
XYZ    | In this document, the axis names are the same as those used by Notch. Y points upwards, X points South, and Z points West.

Packets
========

All packets begin with a single "Packet ID" byte. Listed packet size includes this byte. Packets are either "server to client", "client to server", or "Two-Way" (both). Packets are not prefixed with their length. For variable length packets, you must parse it completely to determine its length.

Keep Alive (0x00)
-----------------
*Two-Way*

The server will frequently send out a keep-alive, each containing a random ID. The client must respond with the same packet. The Beta server will disconnect a client if it doesn't receive at least one packet before 1200 in-game ticks, and the Beta client will time out the connection under the same conditions. The client may send packets with Keep-alive ID=0.

Packet ID   | Field Name    | Field Type | Example   | Notes
------------|---------------|------------|-----------|----------------------------
0x00        | Keep-alive ID | int        | 957759560 | Server-generated random id 
Total Size: | 5 bytes

Login Request (0x01)
--------------------
*Server to Client*

See [Protocol Encryption](Protocol_Encryption) for information on logging in.

Packet ID   | Field Name    | Field Type | Example   | Notes
------------|---------------|------------|-----------|----------------------------
0x01        | Entity ID     | int        | 957759560 | Server-generated random id 
            | Level type    | string     | default   | default, flat, or largeBiomes. level-type in server.properties
            | Game mode     | byte       | 0         | 0: survival, 1: creative, 2: adventure. Bit 3 (0x8) is the hardcore flag
            | Dimension     | byte       | 0         | -1: nether, 0: overworld, 1: end 
            | Difficulty    | byte       | 1         | 0 thru 3 for Peaceful, Easy, Normal, Hard  
            | Not used      | byte       | 0         | Only 0 observed from vanilla server, was previously world height 
            | Max players   | byte       | 8         | Used by the client to draw the player list 
Total Size: | 12 bytes + length of strings

Handshake (0x02)
----------------
*Client to server*

See [Protocol Encryption](Protocol_Encryption) for information on logging in.

Packet ID   | Field Name       | Field Type | Example   | Notes
------------|------------------|------------|-----------|----------------------------
0x02        | Protocol Version | byte       | 51        | As of 1.5.2 the protocol version is 61. See [Protocol version numbers](Protocol_version_numbers) for list. 
            | Username         | string     |  _AlexM   | The username of the player attempting to connect 
            | Server Host      | string     | localhost | 
            | Server Port      | int        | 25565     | 
Total Size: | 10 bytes + length of strings

Chat Message (0x03)
----------------
*Two-Way*

The default server will check the message to see if it begins with a '/'. If it doesn't, the username of the sender is prepended and sent to all other clients (including the original sender). If it does, the server assumes it to be a command and attempts to process it. A message longer than 100 characters will cause the server to kick the client. (As of 1.3.2, the vanilla client appears to limit the text a user can enter to 100 charaters.) This limits the chat message packet length to 203 bytes (as characters are encoded on 2 bytes). Note that this limit does not apply to chat messages sent by the server, which are limited to 32767 characters since 1.2.5. This change was initially done by allowing the client to not slice the message up to 119 (the previous limit), without changes to the server. For this reason, the vanilla server kept the code to cut messages at 119, but this isn't a protocol limitation and can be ignored. 

For more information, see [Chat](Chat). 


Packet ID   | Field Name | Field Type | Example            | Notes
------------|------------|------------|--------------------|----------------------------
0x03        | Message    | string     | <Bob> Hello World! | User input must be sanitized server-side
Total Size: | 10 bytes + length of strings


Time Update (0x04)
----------------
*Server to Client*

Time is based on ticks, where 20 ticks happen every second. There are 24000 ticks in a day, making Minecraft days exactly 20 minutes long. 

The time of day is based on the timestamp modulo 24000. 0 is sunrise, 6000 is noon, 12000 is sunset, and 18000 is midnight. 

The default SMP server increments the time by 20 every second. 


Packet ID   | Field Name       | Field Type | Example  | Notes
------------|------------------|------------|----------|----------------------------
0x04        | Age of the world | long       | 45464654 | In ticks; not changed by server commands
            | Time of Day      | long       | 21321    | The world (or region) time, in ticks
Total Size: | 17 Bytes


Entity Equipment (0x05)
----------------
*Server to Client*

Packet ID   | Field Name | Field Type        | Example    | Notes
------------|------------|-------------------|------------|----------------------------
0x04        | Entity ID  | int               | 0x00010643 | Named Entity ID 
            | Slot       | short             | 4          | Equipment slot: 0=held, 1-4=armor slot (1 - boots, 2 - leggings, 3 - chestplate, 4 - helmet) 
            | Item       | [slot](Slot_Data) |            | Item in slot format
Total Size: | 7 bytes + slot data


Spawn Position (0x06)
----------------
*Server to Client*

Sent by the server after login to specify the coordinates of the spawn point (the point at which players spawn at, and which the compass points to). It can be sent at any time to update the point compasses point at. 

Packet ID   | Field Name | Field Type | Example | Notes
------------|------------|------------|---------|----------------------------
0x06        | X          | int        | 117     | Spawn X in block coordinates
            | Y          | int        | 70      | Spawn Y in block coordinates
            | Z          | int        | -46     | Spawn Z in block coordinates
Total Size: | 13 bytes


Use Entity (0x07)
----------------
*Client to Server*

This packet is sent from the client to the server when the client attacks or right-clicks another entity (a player, minecart, etc). 

A Notchian server only accepts this packet if the entity being attacked/used is visible without obstruction and within a 4-unit radius of the player's position. 


Packet ID   | Field Name   | Field Type | Example | Notes
------------|--------------|------------|---------|----------------------------
0x07        | User         | int        | 1298    | The entity of the player (ignored by the server) 
            | Target       | int        | 1805    | The entity the player is interacting with 
            | Mouse button | boolean    | -true   | true when the player is left-clicking and false when right-clicking.
Total Size: | 10 bytes


Update Health (0x08)
----------------
*Server to Client*

Sent by the server to update/set the health of the player it is sent to. Added in protocol version 5. 

Food saturation acts as a food "overcharge". Food values will not decrease while the saturation is over zero. Players logging in automatically get a saturation of 5.0. Eating food increases the saturation as well as the food bar. 


Packet ID   | Field Name      | Field Type | Example | Notes
------------|-----------------|------------|---------|----------------------------
0x08        | Health          | short      | 20      | 0 or less = dead, 20 = full HP
            | Food            | short      | 20      | 0 - 20
            | Food Saturation | float      | 5.0     | Seems to vary from 0.0 to 5.0 in integer increments
Total Size: | 9 bytes


Respawn (0x09)
----------------
*Server to Client*

To change the player's dimension (overworld/nether/end), send them a respawn packet with the appropriate dimension, followed by prechunks/chunks for the new dimension, and finally a position and look packet. You do not need to unload chunks, the client will do it automatically. 

Packet ID   | Field Name      | Field Type | Example | Notes
------------|-----------------|------------|---------|----------------------------
0x09        | Dimension       | int        | 1       | -1: The Nether, 0: The Overworld, 1: The End
            | Difficulty      | byte       | 1       | 0 thru 3 for Peaceful, Easy, Normal, Hard. 1 is always sent c->s
            | Game mode       | byte       | 1       | 0: survival, 1: creative, 2: adventure. The hardcore flag is not included
            | World type      | short      | 256     | Defaults to 256 
            | Level type      | string     | default | See [0x01 login](Protocol#login-request-0x01)
Total Size: | 11 bytes + length of string 


Player (0x0A)
----------------
*Client to Server*

This packet is used to indicate whether the player is on ground (walking/swimming), or airborne (jumping/falling). 

When dropping from sufficient height, fall damage is applied when this state goes from False to True. The amount of damage applied is based on the point where it last changed from True to False. Note that there are several movement related packets containing this state. 

This packet was previously referred to as Flying 


Packet ID   | Field Name | Field Type | Example | Notes
------------|------------|------------|---------|----------------------------
0x0A        | On Ground  | boolean    | 1       | True if the client is on the ground, False otherwise 
Total Size: | 2 bytes


Player Position (0x0B)
----------------
*Client to Server*

Updates the players XYZ position on the server. If Stance - Y is less than 0.1 or greater than 1.65, the stance is illegal and the client will be kicked with the message “Illegal Stance”. If the distance between the last known position of the player on the server and the new position set by this packet is greater than 100 units will result in the client being kicked for "You moved too quickly :( (Hacking?)" Also if the absolute number of X or Z is set greater than 3.2E7D the client will be kicked for "Illegal position" 


Packet ID   | Field Name | Field Type | Example | Notes
------------|------------|------------|---------|----------------------------
0x0B        | X          | double     | 102.809 | Absolute position 
            | Y          | double     | 70.00   | Absolute position 
            | Stance     | double     | 71.62   | Used to modify the players bounding box when going up stairs, crouching, etc…
            | Z          | double     | 68.30   | Absolute position
            | On Ground  | boolean    | 1       | Derived from packet [0x0A](Protocol#player-0x0A)
Total Size: | 34 bytes


Player Look (0x0C)
----------------
*Client to Server*

Updates the direction the player is looking in. 

Yaw is measured in degrees, and does not follow classical trigonometry rules. The unit circle of yaw on the xz-plane starts at (0, 1) and turns backwards towards (-1, 0), or in other words, it turns clockwise instead of counterclockwise. Additionally, yaw is not clamped to between 0 and 360 degrees; any number is valid, including negative numbers and numbers greater than 360. 

Pitch is measured in degrees, where 0 is looking straight ahead, -90 is looking straight up, and 90 is looking straight down. 

You can get a unit vector from a given yaw/pitch via: 

	x = -cos(pitch) * sin(yaw)
	y = -sin(pitch)
	z =  cos(pitch) * cos(yaw)

[![The unit circle for yaw](images/Minecraft-trig-yaw-small.png)](images/Minecraft-trig-yaw.png)

Packet ID   | Field Name | Field Type | Example | Notes
------------|------------|------------|---------|----------------------------
0x0C        | Yaw        | float      | 0.00    | Absolute rotation on the X Axis, in degrees
            | Pitch      | float      | 0x00    | Absolute rotation on the Y Axis, in degrees  
            | On Ground  | boolean    | 1       | Derived from packet [0x0A](Protocol#player-0x0A)
Total Size: | 10 bytes


Player Position and Look (0x0D)
----------------
*Two Way*

A combination of [Player Look](Protocol#player-look-0x0C) and [Player Position](Protocol#player-position-0x0B). 

Note: When this packet is sent from the server, the 'Y' and 'Stance' fields are swapped. 


Packet ID   | Field Name | Field Type | Example | Notes
------------|------------|------------|---------|----------------------------
0x0D        | X          | double     | 102.809 | Absolute position 
            | Y          | double     | 70.00   | Absolute position 
            | Stance     | double     | 71.62   | Used to modify the players bounding box when going up stairs, crouching, etc…
            | Z          | double     | 68.30   | Absolute position
            | Yaw        | float      | 0.00    | Absolute rotation on the X Axis, in degrees
            | Pitch      | float      | 0x00    | Absolute rotation on the Y Axis, in degrees  
            | On Ground  | boolean    | 0       | Derived from packet [0x0A](Protocol#player-0x0A)
Total Size: | 42 bytes


Player Digging (0x0E)
----------------
*Client to Server*

Sent when the player mines a block. A Notchian server only accepts digging packets with coordinates within a 6-unit radius of the player's position. 


Packet ID   | Field Name | Field Type | Example | Notes
------------|------------|------------|---------|----------------------------
0x0E        | Status     | byte       | 1       | The action the player is taking against the block (see below)
0x0E        | X          | int        | 32      | Block position 
            | Y          | byte       | 64      | Block position
            | Z          | int        | 32      | Block position
            | Face       | byte       | 3       | The face being hit (see below)
Total Size: | 12 bytes

Status can (currently) be one of six values:

Meaning                     | Value
----------------------------|-------
Started digging             | 0
Cancelled digging           | 1
Finished digging            | 2
Drop item stack             | 3
Drop item                   | 4
Shoot arrow / finish eating | 5

Notchian clients send a 0 (started digging) when they start digging and a 2 (finished digging) once they think they are finished. If digging is aborted, the client simply send a 1 (Cancel digging). 

Status code 4 (drop item) is a special case. In-game, when you use the Drop Item command (keypress 'q'), a dig packet with a status of 4, and all other values set to 0, is sent from client to server. Status code 3 is similar, but drops the entire stack. 

Status code 5 (shoot arrow / finish eating) is also a special case. The x, y and z fields are all set to 0 like above, with the exception of the face field, which is set to 255. 

The face can be one of six values, representing the face being hit: 

Value  |  0 |  1 |  2 |  3 |  4 |  5
-------|----|----|----|----|----|-----
Offset | -Y | +Y | -Z | +Z | -X | +X

In 1.7.3, when a player opens a door with left click the server receives Packet 0xE+start digging and opens the door. 


Player Block Placement (0x0F)
----------------
*Client to Server*

Packet ID   | Field Name        | Field Type        | Example | Notes
------------|-------------------|-------------------|---------|----------------------------
0x0F        | X                 | int               | 32      | Block position
            | Y                 | unsigned byte     | 64      | Block position
            | Z                 | int               | 32      | Block position
            | Direction         | byte              | 3       | The offset to use for block/item placement (see below) 
            | Held item         | [slot](Slot_Data) |         | 
            | Cursor position X | byte              | 0-16    | The position of the crosshair on the block 
            | Cursor position Y | byte              | 0-16    | 
            | Cursor position Z | byte              | 0-16    | 
Total Size: | 14 bytes + slot data

In normal operation (ie placing a block), this packet is sent once, with the values set normally. 

This packet has a special case where X, Y, Z, and Direction are all -1. (Note that Y is unsigned so set to 255.) This special packet indicates that the currently held item for the player should have its state updated such as eating food, shooting bows, using buckets, etc. 

In a Notchian Beta client, the block or item ID corresponds to whatever the client is currently holding, and the client sends one of these packets any time a right-click is issued on a surface, so no assumptions can be made about the safety of the ID. However, with the implementation of server-side inventory, a Notchian server seems to ignore the item ID, instead operating on server-side inventory information and holding selection. The client has been observed (1.2.5 and 1.3.2) to send both real item IDs and -1 in a single session. 

Special note on using buckets: When using buckets, the Notchian client might send two packets: first a normal and then a special case. The first normal packet is sent when you're looking at a block (e.g. the water you want to scoop up). This normal packet does not appear to do anything with a Notchian server. The second, special case packet appears to perform the action - based on current position/orientation and with a distance check - it appears that buckets can only be used within a radius of 6 units. 


Held Item Change (0x10)
----------------
*Two-Way*

Sent when the player changes the slot selection 


Packet ID   | Field Name | Field Type | Example | Notes
------------|------------|------------|---------|----------------------------
0x10        | Slot ID    | short      | 1       | The slot which the player has selected (0-8)
Total Size: | 3 bytes


Use Bed (0x11)
----------------
*Server to Client*

This packet tells that a player goes to bed. 

The client with the matching Entity ID will go into bed mode. 

This Packet is sent to all nearby players including the one sent to bed. 


Packet ID   | Field Name    | Field Type | Example | Notes
------------|---------------|------------|---------|----------------------------
0x11        | Entity ID     | int        | 89      | Player ID
            | Unknown       | byte       | 0       | Only 0 has been observed 
            | X coordinate  | int        | -247    | Bed headboard X as block coordinate
            | Y coordinate  | byte       | 78      | Bed headboard Y as block coordinate
            | Z coordinate  | int        | 128     | Bed headboard Z as block coordinate
Total Size: | 15 bytes


Animation (0x12)
----------------
*Two-Way*

Sent whenever an entity should change animation. 


Packet ID   | Field Name    | Field Type | Example | Notes
------------|---------------|------------|---------|----------------------------
0x12        | Entity ID     | int        | 55534   | Player ID
            | Animation     | byte       | 1       | Animation ID
Total Size: | 6 bytes

Animation can be one of the following values: 

ID  | Animation
----|------------
0   | No animation
1   | Swing arm
2   | Damage animation
3   | Leave bed
5   | Eat food
102 | (unknown)
104 | Crouch
105 | Uncrouch

Only 1 (swing arm) is sent by notchian clients. Crouching is sent via 0x13. Damage is server-side, and so is not sent by notchian clients. See also 0x26.


Entity Action (0x13) 
----------------
*Client to Server*

Sent at least when crouching, leaving a bed, or sprinting. To send action animation to client use 0x28. The client will send this with Action ID = 3 when "Leave Bed" is clicked. 


Packet ID   | Field Name    | Field Type | Example | Notes
------------|---------------|------------|---------|----------------------------
0x13        | Entity ID     | int        | 55534   | Player ID
            | Action ID     | byte       | 1       | The ID of the action, see below.
Total Size: | 6 bytes

Action ID can be one of the following values:  

ID  | Animation
----|------------
1   | Crouch
2   | Uncrouch
3   | Leave bed
4   | Start sprinting
5   | Stop sprinting


Spawn Named Entity (0x14)
----------------
*Server to Client*

The only named entities (at the moment) are players (either real or NPC/Bot). This packet is sent by the server when a player comes into visible range, not when a player joins. 

Servers can, however, safely spawn player entities for players not in visible range. The client appears to handle it correctly. 

At one point, the Notchian client was not okay with receiving player entity packets, including 0x14, that refer to its own username or EID; and would teleport to the absolute origin of the map and fall through the Void any time it received them. However, in more recent versions, it appears to handle them correctly, by spawning a new entity as directed (though future packets referring to the entity ID may be handled incorrectly). 


Packet ID   | Field Name    | Field Type                                  | Example | Notes
------------|---------------|---------------------------------------------|---------|----------------------------
0x14        | Entity ID     | int                                         | 94453   | Player ID
            | Player Name   | string                                      | Twdtwd  | Max length of 16 
            | X             | int                                         | 784     | Player X as Absolute Integer
            | Y             | int                                         | 2131    | Player Y as Absolute Integer
            | Z             | int                                         | -752    | Player Z as Absolute Integer
            | Yaw           | byte                                        | 0       | Player rotation as a packed byte  
            | Pitch         | byte                                        | 0       | Player rotation as a packed byte  
            | Current Item  | short                                       | 0       | The item the player is currently holding. Note that this should be 0 for "no item", unlike -1 used in other packets. A negative value crashes clients.  
            | Metadata      | [Metadata](Entities#Entity_Metadata_Format) |         | The 1.3 client crashes on packets with no metadata, but the server can send any metadata key of 0, 1 or 8 and the client is fine. 
Total Size: | 22 bytes + length of strings + metadata (at least 1)


Collect Item (0x16) 
----------------
*Client to Server*

Sent at least when crouching, leaving a bed, or sprinting. To send action animation to client use 0x28. The client will send this with Action ID = 3 when "Leave Bed" is clicked. 


Packet ID   | Field Name    | Field Type | Example | Notes
------------|---------------|------------|---------|----------------------------
0x16        | Collected EID | int        | 38      |
            | Collector EID | int        | 20      |
Total Size: | 9 bytes


Spawn Object/Vehicle (0x17) 
---------------------------
*Server to Client*

Sent by the server when an Object/Vehicle is created. The throwers entity id is now used for fishing floats too. 


Packet ID   | Field Name    | Field Type                 | Example | Notes
------------|---------------|----------------------------|---------|----------------------------
0x17        | Entity ID     | int                        | 62      | Entity ID of the Object  
            | Type          | byte                       | 11      | The type of object (see [Objects](Entities#Objects)) 
            | X             | int                        | 16080   | The Absolute Integer X Position of the object
            | Y             | int                        | 2299    | The Absolute Integer Y Position of the object
            | Z             | int                        | 592     | The Absolute Integer Z Position of the object
            | Yaw           | byte                       | 0       | The yaw in steps of 2p/256  
            | Pitch         | byte                       | 67      | The pitch in steps of 2p/256
            | Object Data   | [Object Data](Object_Data) |         | [Object Data](Object_Data)
Total Size: | 23 or 29 bytes


Spawn Mob (0x18)
----------------
*Server to Client*

Sent by the server when a Mob Entity is Spawned 


Packet ID   | Field Name    | Field Type                                  | Example | Notes
------------|---------------|---------------------------------------------|---------|----------------------------
0x18        | Entity ID     | int                                         | 446     | Entity ID
            | Type          | byte                                        | 11      | The type of mob (see [Objects](Entities#Mobs)) 
            | X             | int                                         | 784     | The Absolute Integer X Position of the object
            | Y             | int                                         | 2131    | The Absolute Integer Y Position of the object
            | Z             | int                                         | -752    | The Absolute Integer Z Position of the object 
            | Pitch         | byte                                        | 0       | The pitch in steps of 2p/256  
            | Head Pitch    | byte                                        | 10      | The head pitch in steps of 2p/256 
            | Yaw           | byte                                        | -27     | The yaw in steps of 2p/256  
            | Velocity X    | short                                       | 0       | 
            | Velocity Y    | short                                       | 0       | 
            | Velocity Z    | short                                       | 0       | 
            | Metadata      | [Metadata](Entities#Entity_Metadata_Format) | 0 0 127 | Varies by mob, see [Entities](Entities)
Total Size: | 27 bytes + Metadata (at least 3 as you must send at least 1 item of metadata)


Spawn Painting (0x19) 
----------------
*Server to Client*

This packet shows location, name, and type of painting.


Packet ID   | Field Name    | Field Type                                  | Example  | Notes
------------|---------------|---------------------------------------------|----------|----------------------------
0x19        | Entity ID     | int                                         | 446      | Entity ID
            | Title         | string                                      | Creepers | Name of the painting; max length 13 (length of "SkullAndRoses")
            | X             | int                                         | 50       | Center X coordinate 
            | Y             | int                                         | 66       | Center Y coordinate 
            | Z             | int                                         | -50      | Center Z coordinate 
            | Direction     | int                                         | 0        | Direction the painting faces (0 -z, 1 -x, 2 +z, 3 +x)  
Total Size: | 23 bytes + length of string

Calculating the center of an image: given a (width x height) grid of cells, with (0, 0) being the top left corner, the center is (max(0, width / 2 - 1), height / 2). E.g. 

2x1 (1, 0) 4x4 (1, 2) 


Entity Velocity (0x1C) 
----------------
*Server to Client*

This packet is new to version 4 of the protocol, and is believed to be Entity Velocity/Motion. 

Velocity is believed to be in units of 1/8000 of a block per server tick (50ms); for example, -1343 would move (-1343 / 8000) = −0.167875 blocks per tick (or −3,3575 blocks per second). 

(This packet data values are not fully verified) 


Packet ID   | Field Name    | Field Type | Example | Notes
------------|---------------|------------|---------|----------------------------
0x1C        | Entity ID     | int        | 1805    | Entity ID
            | Velocity X    | short      | -1343   | Velocity on the X axis 
            | Velocity Y    | short      | 0       | Velocity on the Y axis 
            | Velocity Z    | short      | 0       | Velocity on the Z axis 
Total Size: | 11 bytes


Destroy Entity (0x1D) 
----------------
*Server to Client*

Sent by the server when an list of Entities is to be destroyed on the client. 


Packet ID   | Field Name    | Field Type   | Example       | Notes
------------|---------------|--------------|---------------|----------------------------
0x1D        | Entity Count  | int          | 3             | The amount of entities which should be destroyed 
            | Entity IDs    | array of int | 452, 546, 123 | The list of entity ids which should be destroyed 
Total Size: | 2 + (entity count * 4) bytes

Entity (0x1E) 
----------------
*Server to Client*

Sent by the server when an list of Entities is to be destroyed on the client. 


Packet ID   | Field Name    | Field Type   | Example       | Notes
------------|---------------|--------------|---------------|----------------------------
0x1E        | Entity ID     | int          | 446           | Entity ID
Total Size: | 5 bytes


Entity Relative Move (0x1F)
----------------
*Server to Client*

This packet is sent by the server when an entity moves less then 4 blocks; if an entity moves more than 4 blocks [Entity Teleport](Protocol#entity-teleport-0x22) should be sent instead. 

This packet allows at most four blocks movement in any direction, because byte range is from -128 to 127. Movement is an offset of Absolute Int; to convert relative move to block coordinate offset, divide by 32. 



Packet ID   | Field Name    | Field Type   | Example       | Notes
------------|---------------|--------------|---------------|----------------------------
0x1F        | Entity ID     | int          | 446           | Entity ID
            | dX            | byte         | 1             | X axis Relative movement as an Absolute Integer 
            | dY            | byte         | -7            | Y axis Relative movement as an Absolute Integer 
            | dZ            | byte         | 5             | Z axis Relative movement as an Absolute Integer 
Total Size: | 8 bytes


Entity Look (0x20) 
----------------
*Server to Client*

This packet is sent by the server when an entity rotates. Example: "Yaw" field 64 means a 90 degree turn. 


Packet ID   | Field Name    | Field Type   | Example       | Notes
------------|---------------|--------------|---------------|----------------------------
0x20        | Entity ID     | int          | 459           | Entity ID
            | Yaw           | byte         | 126           | The X Axis rotation as a fraction of 360
            | Pitch         | byte         | 0             | The Y Axis rotation as a fraction of 360
Total Size: | 7 bytes


Entity Look and Relative Move (0x21)
----------------
*Server to Client*

This packet is sent by the server when an entity rotates and moves. Since a byte range is limited from -128 to 127, and movement is offset of Absolute Int, this packet allows at most four blocks movement in any direction. (-128/32 == -4) 


Packet ID   | Field Name    | Field Type   | Example       | Notes
------------|---------------|--------------|---------------|----------------------------
0x21        | Entity ID     | int          | 446           | Entity ID
            | dX            | byte         | 1             | X axis Relative movement as an Absolute Integer 
            | dY            | byte         | -7            | Y axis Relative movement as an Absolute Integer 
            | dZ            | byte         | 5             | Z axis Relative movement as an Absolute Integer 
            | Yaw           | byte         | 126           | The X Axis rotation as a fraction of 360
            | Pitch         | byte         | 0             | The Y Axis rotation as a fraction of 360
Total Size: | 10 bytes


Entity Teleport (0x22)
----------------
*Server to Client*

This packet is sent by the server when an entity moves more than 4 blocks. 


Packet ID   | Field Name    | Field Type   | Example       | Notes
------------|---------------|--------------|---------------|----------------------------
0x22        | Entity ID     | int          | 459           | Entity ID
            | X             | int          | 14162         | X axis position as an Absolute Integer 
            | Y             | int          | 2176          | Y axis position as an Absolute Integer 
            | Z             | int          | 1111          | Z axis position as an Absolute Integer 
            | Yaw           | byte         | 126           | The X Axis rotation as a fraction of 360
            | Pitch         | byte         | 0             | The Y Axis rotation as a fraction of 360
Total Size: | 19 bytes


Entity Head Look (0x23)
----------------
*Server to Client*

Changes the direction an entity's head is facing. 


Packet ID   | Field Name    | Field Type   | Example       | Notes
------------|---------------|--------------|---------------|----------------------------
0x23        | Entity ID     | int          | 446           | Entity ID
            | Head Yaw      | byte         | 1             | Head yaw in steps of 2p/256
Total Size: | 6 bytes


Entity Status (0x26)
----------------
*Server to Client*


Packet ID   | Field Name    | Field Type   | Example       | Notes
------------|---------------|--------------|---------------|----------------------------
0x26        | Entity ID     | int          | 34353         | Entity ID
            | Entity Status | byte         | 0x03          | See below
Total Size: | 6 bytes

Entity Status | Meaning
--------------|---------
2             |  Entity hurt  
3             |  Entity dead  
6             |  Wolf taming  
7             |  Wolf tamed  
8             |  Wolf shaking water off itself  
9             |  (of self) Eating accepted by server  
10            |  Sheep eating grass  
11            |  Iron Golem handing over a rose  
12            |  Spawn "heart" particles near a villager  
13            |  Spawn particles indicating that a villager is angry and seeking revenge  
14            |  Spawn happy particles near a villager  
15            |  Spawn a "magic" particle near the Witch  
16            |  Zombie converting into a villager by shaking violently  
17            |  A firework exploding  


Attach Entity (0x27)
----------------
*Server to Client*

This packet is sent when a player has been attached to an entity (e.g. Minecart)


Packet ID   | Field Name    | Field Type   | Example       | Notes
------------|---------------|--------------|---------------|----------------------------
0x27        | Entity ID     | int          | 1298          | The player entity ID being attached
            | Vehicle ID    | int          | 1805          | The vehicle entity ID attached to (-1 for unattaching)
Total Size: | 9 bytes


Entity Metadata (0x28) 
----------------
*Server to Client*


Packet ID   | Field Name         | Field Type                                  | Example        | Notes
------------|--------------------|---------------------------------------------|----------------|----------------------------
0x28        | Entity ID          | int                                         | 0x00000326     | Unique entity ID to update. 
            | Entity Metadata    | [Metadata](Entities#Entity_Metadata_Format) | 0x00 0x01 0x7F | Metadata varies by entity. See [Entities](Entities)
Total Size: | 5 bytes + Metadata


Entity Effect (0x29) 
----------------
*Server to Client*


Packet ID   | Field Name | Field Type | Example | Notes
------------|------------|------------|---------|---------------------
0x29        | Entity ID  | int        | 14      | Entity ID of a player
            | Effect ID  | byte       | 17      | See [here](Potion_effect#Parameters) 
            | Amplifier  | byte       | 0       | 
            | Duration   | short      | 64      | 
Total Size: | 9 bytes


Remove Entity Effect (0x2A) 
----------------
*Server to Client*


Packet ID   | Field Name | Field Type | Example | Notes
------------|------------|------------|---------|---------------------
0x2A        | Entity ID  | int        | 14      | Entity ID of a player
            | Effect ID  | byte       | 17      | See [here](Potion_effect#Parameters) 
Total Size: | 6 bytes


Set Experience (0x2B) 
----------------
*Server to Client*

Sent by the server when the client should change experience levels. 

Packet ID   | Field Name       | Field Type | Example | Notes
------------|------------------|------------|---------|---------------------
0x2B        | Experience bar   | float      | 0.59601 | Used for drawing the experience bar - value is between 0 and 1. 
            | Level            | short      | 8       | 
            | Total experience | short      | 130     | 
Total Size: | 9 bytes


Chunk Data (0x33)
----------------
*Server to Client*

See also: [SMP Map Format](SMP_Map_Format)

Packet ID   | Field Name           | Field Type          | Example | Notes
------------|----------------------|---------------------|---------|---------------------
0x33        | X                    | int                 | 5       | Chunk X Coordinate (*16 to get true X) 
            | Z                    | int                 | 5       | Chunk Z Coordinate (*16 to get true Z) 
            | Ground-up continuous | boolean             | 1       | This is True if the packet represents all sections in this vertical column, where the primary bit map specifies exactly which sections are included, and which are air. 
            | Primary bit map      | unsigned short      |         | Bitmask with 1 for every 16x16x16 section which data follows in the compressed data.  
            | Add bit map          | unsigned short      | 0       | Same as above, but this is used exclusively for the 'add' portion of the payload 
            | Compressed size      | int                 |         | Size of compressed chunk data. 
            | Compressed data      | unsigned byte array | ...     | The chunk data is compressed using ZLib Deflate function. 
Total Size: | 18 bytes + Compressed chunk size 


Multi Block Change (0x34) 
----------------
*Server to Client*


Packet ID   | Field Name   | Field Type          | Example | Notes
------------|--------------|---------------------|---------|---------------------
0x34        | Chunk X      | int                 | -9      | Chunk X Coordinate (*16 to get true X) 
            | Chunk Z      | int                 | 12      | Chunk Z Coordinate (*16 to get true Z) 
            | Record count | short               |         | The number of blocks affected
            | Data size    | int                 |         | The total size of the data, in bytes. Should always be 4*record count - please confirm. 
            | Data         |                     | ...     | Coordinates, type, and metadata of blocks to change (see below table). 
Total Size: | 15 bytes + Arrays

Each record is four bytes. 

Bit mask    | Width   | Meaning
------------|---------|------------------
00 00 00 0F | 4 bits  | Block metadata  
00 00 FF F0 | 12 bits | Block ID  
00 FF 00 00 | 8 bits  | Y co-ordinate  
0F 00 00 00 | 4 bits  | Z co-ordinate, relative to chunk  
F0 00 00 00 | 4 bits  | X co-ordinate, relative to chunk  


Block Change (0x35) 
----------------
*Server to Client*


Packet ID   | Field Name     | Field Type          | Example | Notes
------------|----------------|---------------------|---------|---------------------
0x35        | X              | int                 | 502     | Block X Coordinate 
            | Y              | byte                | 71      | Block Y Coordinate 
            | Z              | int                 | 18      | Block Z Coordinate 
            | Block Type     | short               | 78      | The new block type for the block
            | Block Metadata | int                 | 0       | The new Metadata for the block
Total Size: | 13 bytes


Block Action (0x36)
----------------
*Server to Client*

This packet is used for a number of things: 

- Chests opening and closing 
- Pistons pushing and pulling 
- Note blocks playing 



Packet ID   | Field Name     | Field Type          | Example | Notes
------------|----------------|---------------------|---------|---------------------
0x36        | X              | int                 | 502     | Block X Coordinate 
            | Y              | short               | 71      | Block Y Coordinate 
            | Z              | int                 | 18      | Block Z Coordinate 
            | Byte 1         | byte                | 3       | Varies depending on block - see below
            | Byte 2         | byte                | 17      | Varies depending on block - see below 
            | Block ID       | short               | 29      | The block id this action is set for 
Total Size: | 15 bytes


See Also: [Block Actions](Block_Actions)


Block Break Animation (0x37)
----------------
*Server to Client*


Packet ID   | Field Name     | Field Type          | Example | Notes
------------|----------------|---------------------|---------|---------------------
0x37        | Entity ID      | int                 | 123     | B Entity breaking the block? 
            | X              | int                 | 71      | Block X Coordinate 
            | Y              | int                 | 18      | Block Y Coordinate 
            | Z              | int                 | 3       | Block Z Coordinate 
            | Destroy Stage  | byte                | 3       | How far destroyed this block is.
Total Size: | 18 bytes


Map Chunk Bulk (0x38) 
----------------
*Server to Client*

See also: [SMP Map Format](SMP_Map_Format)

To reduce the number of bytes this packet is used to send chunks together for better compression results. 


Packet ID   | Field Name           | Field Type          | Example | Notes
------------|----------------------|---------------------|---------|---------------------
0x38        | Chunk column count   | short               |         | The number of chunks in this packet 
            | Data length          | int                 |         | The size of the data field  
            | Sky light sent       | boolean             |         | Whether or not the chunk data contains a light nibble array. This is true in the main world, false in the end + nether 
            | Data                 | byte array          |         | Compressed chunk data  
            | Meta information     | See below           |         | See below  
Total Size: | 8 + (Chunk data size) + 12 * (Chunk Count) bytes

### Meta Information Structure

This structure is repeated for each chunk column sent

Field Name     | Field Type     | Example | Notes
---------------|----------------|---------|-------------------------
Chunk X        | int            | 10      | The X coordinate of the specific chunk  
Chunk Z        | int            | 10      | The Z coordinate of the specific chunk  
Primary bitmap | unsigned short | 15      | A bitmap which specifies which sections are not empty in this chunk  
Add bitmap     | unsigned short | 0       | A bitmap which specifies which sections need add information because of very high block ids. not yet used. needs verification  
Total Size:    | 12 bytes  


Explosion (0x3C) 
----------------
*Server to Client*

Sent when an explosion occurs (creepers, TNT, and ghast fireballs). 


Packet ID   | Field Name      | Field Type                 | Example | Notes
------------|-----------------|----------------------------|---------|---------------------
0x3C        | X               | double                     |         | 
            | Y               | double                     |         | 
            | Z               | double                     |         | 
            | Radius          | float                      | 3.0     | Currently unused in the client 
            | Record Count    | int                        |         | This is the count, not the size. The size is 3 times this value.  
            | Records         | (byte, byte, byte) × count |         |  Each record is 3 signed bytes long, each bytes are the XYZ (respectively) offsets of affected blocks.  
            | Player Motion X | float                      |         | X velocity of the player being pushed by the explosion
            | Player Motion X | float                      |         | Y velocity of the player being pushed by the explosion 
            | Player Motion X | float                      |         | Z velocity of the player being pushed by the explosion
Total Size: | 45 bytes + 3*(Record count) bytes

Each block in Records is set to air. Coordinates for each axis in record is int(X) + record.x 


Sound Or Particle Effect (0x3D) 
----------------
*Server to Client*

Sent when a client is to play a sound or particle effect. 

By default, the minecraft client adjusts the volume of sound effects based on distance. The final boolean field is used to disable this, and instead the effect is played from 2 blocks away in the correct direction. Currently this is only used for effect 1013 (mob.wither.spawn), and is ignored for any other value by the client. 
 


Packet ID   | Field Name              | Field Type                 | Example | Notes
------------|-------------------------|----------------------------|---------|---------------------
0x3D        | Effect ID               | int                        | 1003    | The ID of the effect, see below.  
            | X                       | int                        |         | The X location of the effect. 
            | Y                       | byte                       |         | The Y location of the effect. 
            | Z                       | int                        |         | The Z location of the effect. 
            | Data                    | int                        | 0       | Extra data for certain effects, see below. 
            | Disable relative volume | boolean                    | false   | See above 
Total Size: | 45 bytes + 3*(Record count) bytes

Each block in Records is set to air. Coordinates for each axis in record is int(X) + record.x 

### Effects

**Sound:**

- 1000: random.click 
- 1001: random.click 
- 1002: random.bow 
- 1003: random.door_open or random.door_close (50/50 chance) 
- 1004: random.fizz 
- 1005: Play a music disc. **Data**: [Record ID](Music_Discs)
- (1006 not assigned) 
- 1007: mob.ghast.charge 
- 1008: mob.ghast.fireball 
- (1009 not assigned) 
- 1010: mob.zombie.wood 
- 1011: mob.zombie.metal 
- 1012: mob.zombie.woodbreak 
- 1013: mob.wither.spawn 

**Particle:**

- 2000: Spawns 10 smoke particles, e.g. from a fire. Data: direction, see below 
- 2001: Block break. **Data**: [Block ID](Data_values) 
- 2002: Splash potion. Particle effect + glass break sound. **Data**: [Potion ID](http://www.lb-stuff.com/Minecraft/PotionDataValues1.9pre3.txt) 
- 2003: Eye of ender. Actual client effect to be determined. 
- 2004: Mob spawn particle effect: smoke + flames

**Smoke directions:**

ID | Direction
---|--------------
0  | South - East  
1  | South  
2  | South - West  
3  | East  
4  | (Up or middle ?)  
5  | West  
6  | North - East  
7  | North  
8  | North - West  


Named Sound Effect (0x3E)
----------------
*Server to Client*

Used to play a sound effect on the client. 

All known sound effect names can be seen [here](https://github.com/SirCmpwn/Craft.Net/blob/master/Craft.Net.Data/SoundEffect.cs). 


Packet ID   | Field Name        | Field Type                 | Example   | Notes
------------|-------------------|----------------------------|-----------|---------------------
0x3E        | Sound name        | string                     | step.gras | 250
            | Effect Position X | int                        | 250       | Effect X multiplied by 8 
            | Effect Position Y | int                        | 250       | Effect Y multiplied by 8 
            | Effect Position Z | int                        | 250       | Effect Z multiplied by 8 
            | Volume            | float                      | 9         | 1 is 100%, can be more 
            | Pitch             | byte                       | 1         | 63 is 100%, can be more
Total Size: | 20 bytes + length of string


Particle (0x3F)
----------------
*Server to Client*

This displays the named particle


Packet ID   | Field Name          | Field Type                 | Example       | Notes
------------|---------------------|----------------------------|---------------|---------------------
0x3F        | Particle name       | string                     | hugeexplosion | The name of the particle to create. A list can be found [here](https://gist.github.com/thinkofdeath/5110835)
            | X                   | float                      | 0             | X position of the particle  
            | Y                   | float                      | 0             | Y position of the particle  
            | Z                   | float                      | 0             | Z position of the particle  
            | Offset Position X   | float                      | 0             | This is added to the X position after being multiplied by random.nextGaussian() 
            | Offset Position X   | float                      | 0             | This is added to the Y position after being multiplied by random.nextGaussian() 
            | Offset Position X   | float                      | 0             | This is added to the Z position after being multiplied by random.nextGaussian() 
            | Particle speed      | float                      | 0             | The speed of each particle  
            | Number of particles | int                        | 0             | The number of particles to create 
Total Size: | 34 bytes + length of string  


Change Game State (0x46) 
----------------
*Server to Client*

This packet appeared with protocol version 10. Currently, it appears when a bed can't be used as a spawn point and when the rain state changes. it could have additional uses in the future. 

The class has an array of strings linked to reason codes 0, 1, 2, and 3 but only the codes for 1 and 2 are null.


Packet ID   | Field Name | Field Type | Example | Notes
------------|------------|------------|---------|---------------------
0x46        | Reason     | string     | 0       | See below
            | Game mode  | float      | 0       | Used only when reason = 3. 0 is survival, 1 is creative. 
Total Size: | 34 bytes + length of string  

**Reason codes**


Code | Effect           | Text 
-----|------------------|---------------------
0    | Invalid Bed      | "tile.bed.notValid"  
1    | Begin raining    | null  
2    | End raining      | null  
3    | Change game mode | gameMode.changed  
4    | Enter credits    |


Spawn Global Entity (0x47)
----------------
*Server to Client*

With this packet, the server notifies the client of thunderbolts striking within a 512 block radius around the player. The coordinates specify where exactly the thunderbolt strikes. 


Packet ID   | Field Name          | Field Type | Example | Notes
------------|---------------------|------------|---------|---------------------
0x47        | Entity ID           | int        | 4       | The entity ID of the thunderbolt 
            | Type                | byte       | 1       | The global entity type, currently always 1 for thunderbolt.
            | X                   | int        | 133     | Thunderbolt X as Absolute Integer
            | Y                   | int        | 913     | Thunderbolt Y as Absolute Integer
            | Z                   | int        | 63552   | Thunderbolt Z as Absolute Integer
Total Size: | 18 bytes


Open Window (0x64)
----------------
*Server to Client*


This is sent to the client when it should open an inventory, such as a chest, workbench, or furnace. This message is not sent anywhere for clients opening their own inventory. 


Packet ID   | Field Name                | Field Type | Example | Notes
------------|---------------------------|------------|---------|---------------------
0x64        | Window id                 | byte       | 123     | A unique id number for the window to be displayed. Notchian server implementation is a counter, starting at 1. 
            | Inventory Type            | byte       | 2       | The window type to use for display. Check below 
            | Window title              | string     | Chest   | The title of the window.  
            | Number of Slots           | byte       | 3       | Number of slots in the window (excluding the number of slots in the player inventory).  
            | Use provided window title | boolean    | 1       | If false, the client will look up a string like "window.minecart". If true, the client uses what the server provides. 
Total Size: | 7 bytes + length of string

See [inventory windows](Inventory#Windows) for further information. 


Close Window (0x65)
----------------
*Two-Way*


This packet is sent by the client when closing a window. This packet is sent from the server to the client when a window is forcibly closed, such as when a chest is destroyed while it's open. 

Note, notchian clients send a close window message with window id 0 to close their inventory even though there is never an Open Window message for inventory. 



Packet ID   | Field Name | Field Type | Example | Notes
------------|------------|------------|---------|---------------------
0x65        | Window id  | byte       | 0       | This is the id of the window that was closed. 0 for inventory.
Total Size: | 2 bytes


Click Window (0x66) 
----------------
*Client to Server*


This packet is sent by the player when it clicks on a slot in a window. 


Packet ID   | Field Name    | Field Type        | Example | Notes
------------|---------------|-------------------|---------|---------------------
0x66        | Window id     | byte              | 0       | The id of the window which was clicked. 0 for player inventory. 
            | Slot          | short             | 36      | The clicked slot. See below. 
            | Button        | byte              | 1       | The button used in the click. See below. 
            | Action number | short             | 12      | A unique number for the action, used for transaction handling (See the Transaction packet). 
            | Mode          | byte              | 1       | Inventory operation mode. See below. 
            | Clicked item  | [slot](Slot_Data) |         | 
Total Size: | 8 bytes + slot data

See [inventory windows](Inventory#Windows) for further information about how slots are indexed. 

When right-clicking on a stack of items, half the stack will be picked up and half left in the slot. If the stack is an odd number, the half left in the slot will be smaller of the amounts. 

The Action number is actually a counter, starting at 1. This number is used by the server as a transaction ID to send back a [Transaction packet](Protocol#confirm-Transaction-0x6A). 

The distinct type of click performed by the client is determined by the combination of the "Mode" and "Button" fields. 



Mode | Button | Slot     | Trigger 
-----|--------|----------|-------------------------
0    | 0      | N/A      | Left mouse click  
0    | 1      | N/A      | Right mouse click  
1    | 0      | N/A      | Shift + left mouse click  
1    | 1      | N/A      | Shift + right mouse click (Identical behavior)  
2    | 0      | N/A      | Number key 1  
2    | 1      | N/A      | Number key 2  
2    | 2      | N/A      | Number key 3  
2    | ...    | ...      | ...  
2    |8       | N/A      | Number key 9  
3    |2       | N/A      | Middle click  
4    |0       | Not -999 | Drop key (Q)  
4    |1       | Not -999 | Ctrl + Drop key (Ctrl-Q)  
4    |0       | -999     | Left click outside inventory holding nothing (No-op)  
4    |1       | -999     | Right click outside inventory holding nothing (No-op)  
5    |0       | -999     | Starting left mouse paint (Or middle mouse)  
5    |4       | -999     | Starting right mouse paint  
5    |1       | Not -999 | Left mouse painting progress  
5    |5       | Not -999 | Right mouse painting progress  
5    |2       | -999     | Ending left mouse paint  
5    |6       | -999     | Ending right mouse paint  
6    |0       | N/A      | Double click  

Starting from version 1.5, "painting mode" is available for use in inventory windows. It is done by picking up stack of something (more than 1 items), then holding mouse button (left, right or middle) and dragging holded stack over empty (or same type in case of right button ) slots. In that case client sends the following to server after mouse button release (omitting first pickup packet which is sent as usual): 

- packet with mode 5, slot -999 , button (0 for left | 4 for right); 
- packet for every slot painted on, mode is still 5, button (1 | 5); 
- packet with mode 5, slot -999, button (2 | 6); 

If any of the painting packets other than the "progress" ones are sent out of order (for example, a start, some slots, then another start; or a left-click in the middle) the painting status will be reset. 


Set Slot (0x67) 
----------------
*Server to Client*


Sent by the server when an item in a slot (in a window) is added/removed. 


Packet ID   | Field Name | Field Type        | Example | Notes
------------|------------|-------------------|---------|---------------------
0x67        | Window id  | byte              | 0       | The window which is being updated. 0 for player inventory. Note that all known window types include the player inventory. This packet will only be sent for the currently opened window while the player is performing actions, even if it affects the player inventory. After the window is closed, a number of these packets are sent to update the player's inventory window (0). 
            | Slot       | short             | 36      | The slot that should be updated  
            | Slot data  | [slot](Slot_Data) |         | 
Total Size: | 4 bytes + slot data

Note that if window ID and slot are both -1, it means the item currently attached to the cursor. 

See [inventory windows](Inventory#Windows) for further information about how slots are indexed. 

Slots: [[1]](http://gyazo.com/9d52e1fd4dc14790ec66eab4a9aee00e.png) 


Set Window Items (0x68)
----------------
*Server to Client*


Sent by the server when an item in a slot (in a window) is added/removed. This includes the main inventory, equipped armour and crafting slots. 


Packet ID   | Field Name | Field Type                | Example | Notes
------------|------------|---------------------------|---------|---------------------
0x68        | Window id  | byte                      | 1       | The id of window which items are being sent for. 0 for player inventory.  
            | Count      | short                     | 4       | The number of slots (see below)  
            | Slot data  | array of[slot](Slot_Data) |         | 
Total Size: | 4 bytes + size of slot data array 

[![The inventory slots](images/Inventory-slots-small.png)](images/Inventory-slots.png)

See [inventory windows](Inventory#Windows) for further information about how slots are indexed.


Update Window Property (0x69)
----------------
*Server to Client*


Sent by the server when an item in a slot (in a window) is added/removed. This includes the main inventory, equipped armour and crafting slots. 


Packet ID   | Field Name | Field Type | Example | Notes
------------|------------|------------|---------|---------------------
0x69        | Window id  | byte       | 2       | The id of the window. 
            | Property   | short      | 1       | Which property should be updated. 
            | Value      | short      | 650     | The new value for the property. 
Total Size: | 6 bytes

**Furnance**
Properties:

- 0: Progress arrow
- 1: Fire icon: (fuel)

Values:

- 0-200 for progress arrow
- 0-200 for fuel indicator

Ranges are presumably in in-game ticks 

**Enchantment Table** 

Properties: 0, 1 or 2 depending on the "enchantment slot" being given. 

Values: The enchantment's level. 


Confirm Transaction (0x6A) 
----------------
*Two-Way*


A packet from the server indicating whether a request from the client was accepted, or whether there was a conflict (due to lag). This packet is also sent from the client to the server in response to a server transaction rejection packet. 


Packet ID   | Field Name    | Field Type | Example | Notes
------------|---------------|------------|---------|---------------------
0x6A        | Window id     | byte       | 1       | The id of the window that the action occurred in. 
            | Action number | short      | 12      | Every action that is to be accepted has a unique number. This field corresponds to that number. 
            | Accepted?     | boolean    | true    | Whether the action was accepted. 
Total Size: | 5 bytes


Creative Inventory Action (0x6B)  
----------------
*Two-Way*


While the user is in the standard inventory (i.e., not a crafting bench) on a creative-mode server then the server will send this packet: 

- If an item is dropped into the quick bar
- If an item is picked up from the quick bar (item id is -1) 


Packet ID   | Field Name   | Field Type        | Example | Notes
------------|--------------|-------------------|---------|---------------------
0x6B        | Slot         | short             | 36      | Inventory slot 
            | Clicked item | [slot](Slot_Data) |         | 
Total Size: | 3 bytes + slot data 


Enchant Item (0x6C) 
----------------
*Client to Server*


Packet ID   | Field Name  | Field Type | Example | Notes
------------|-------------|------------|---------|---------------------
0x6C        | Window ID   | byte       | 1       | The ID sent by [Open Window](Protocol#open-window-0x64) 
            | Enchantment | byte       |         | The position of the enchantment on the enchantment table window, starting with 0 as the topmost one. 
Total Size: | 3 bytes


Update Sign (0x82) 
----------------
*Two-Way*


Packet ID   | Field Name  | Field Type | Example     | Notes
------------|-------------|------------|-------------|---------------------
0x82        | X           | int        | 128         | Block X Coordinate 
            | Y           | short      | 0           | Block Y Coordinate 
            | Z           | int        | 128         | Block Z Coordinate 
            | Text1       | string     | First line  | First line of text in the sign 
            | Text2       | string     | Second line | Second line of text in the sign 
            | Text3       | string     | Third line  | Third line of text in the sign 
            | Text4       | string     | Fourth line | Fourth line of text in the sign 
Total Size: | 11 bytes + 4 strings

This message is sent from the server to the client whenever a sign is discovered or created. This message is sent from the client to the server when the "Done" button is pushed after placing a sign. This message is NOT sent when a sign is destroyed or unloaded. 


Item Data (0x83) 
----------------
*Server to Client*


Sent to specify complex data on an item; currently used only for maps. 


Packet ID   | Field Name  | Field Type | Example                | Notes
------------|-------------|------------|------------------------|---------------------
0x83        | Item Type   | short      | 358                    | Block X Coordinate 
            | Item ID     | short      | 0                      | Block Y Coordinate 
            | Text length | short      | 35                     | Block Z Coordinate 
            | Text        | byte array | {0,0,0,20,20,20,20,20} | First line of text in the sign 
Total Size: | 7 bytes + Text length 

**Maps** If the first byte of the text is 0, the next two bytes are X start and Y start and the rest of the bytes are the colors in that column. 

If the first byte of the text is 1, the rest of the bytes are in groups of three: (data, x, y). The lower half of the data is the type (always 0 under vanilla) and the upper half is the direction. 


Update Tile Entity (0x84)
----------------
*Server to Client*


Essentially a block update on a tile entity. 


Packet ID   | Field Name  | Field Type                               | Example     | Notes
------------|-------------|------------------------------------------|-------------|---------------------
0x84        | X           | int                                      | 128         | Block X Coordinate 
            | Y           | short                                    | 0           | Block Y Coordinate 
            | Z           | int                                      | 128         | Block Z Coordinate 
            | Action      | byte                                     |             | The type of update to perform 
            | Data length | short                                    |             | Varies
            | NBT Data    | Byte Array - Present if data length > 0  |             | Compressed with gzip. Varies
Total Size: | 12 bytes + itemstack bytes

**Actions**
 
- 1: Set mob displayed inside a mob spawner. Custom 1 contains the [mob type](Entities#Mobs) 


Increment Statistic (0xC8)
----------------
*Server to Client*


Packet ID   | Field Name   | Field Type | Example     | Notes
------------|--------------|------------|-------------|---------------------
0xC8        | Statistic ID | int        | 1003        | The ID of the statistic. See [List of statistics](http://www.minecraftforum.net/viewtopic.php?f=1020&t=295360).
            | Amount       | byte       | 1           | The amount to increment the statistic. 
Total Size: | 6 bytes


Player List Item (0xC9) 
----------------
*Server to Client*

Sent by the notchian server to update the user list (<tab> in the client). The server sends one packet per user per tick, amounting to 20 packets/s for 1 online user, 40 for 2, and so forth. 

Packet ID   | Field Name  | Field Type | Example     | Notes
------------|-------------|------------|-------------|---------------------
0xC9        | Player name | string     | barneygale  | Supports chat colouring, limited to 16 characters. 
            | Online      | boolean    | true        | If false, the client will remove the user from the list. 
            | Ping        | short      | 193         | Ping, presumably in ms.
Total Size: | 6 bytes + length of string 


Player Abilities (0xCA) 
----------------
*Two-Way*

The latter 2 bytes are used to indicate the walking and flying speeds respectively, while the first byte is used to determine the value of 4 booleans. 

These booleans are whether damage is disabled (god mode, '8' bit), whether the player can fly ('4' bit), whether the player is flying ('2' bit), and whether the player is in creative mode ('1' bit). 

To get the values of these booleans, simply AND (&) the byte with 1,2,4 and 8 respectively, to get the 0 or 1 bitwise value. To set them OR (|) them with their repspective masks. The vanilla client sends this packet when the player starts/stops flying with the second parameter changed accordingly. All other parameters are ignored by the vanilla server. 


Packet ID   | Field Name    | Field Type | Example     | Notes
------------|---------------|------------|-------------|---------------------
0xCA        | Flags         | byte       | 5           | 
            | Flying speed  | byte       | 12          | 
            | Walking speed | byte       | 25          | 
Total Size: | 4 bytes


Tab-complete (0xCB)
----------------
*Two-Way*

Sent C->S when the user presses [tab] while writing text. The payload contains all text behind the cursor. 

The server responds with an auto-completion of the last word sent to it. In the case of regular chat, this is a player username. Command names and parameters are also supported. 

In the event of more than one possible completion, the server responds with the options packed into the single string field, separated by a null character. Note that as strings are UTF-16, this is two bytes wide. 


Packet ID   | Field Name    | Field Type | Example     | Notes
------------|---------------|------------|-------------|---------------------
0xCB        | Text          | string     | pd          |
Total Size: | 3 bytes + length of string 


Client Settings (0xCC)
----------------
*Client to Server*

Sent when the player connects, or when settings are changed. 


Packet ID   | Field Name    | Field Type | Example     | Notes
------------|---------------|------------|-------------|---------------------
0xCC        | Locale        | string     | en_GB       |
            | View Distance | byte       | 0           | 0-3 for 'far', 'normal', 'short', 'tiny'.  
            | Chat Flags    | byte       | 8           | Chat settings. See notes below.  
            | Difficulty    | byte       | 0           | Client-side difficulty from options.txt  
            | Show Cape     | boolean    | true        | Client-side "show cape" option 
Total Size: | 7 bytes + length of string 


Chat flags has several values packed into one byte. 

**Chat Enabled**: Bits 0-1. 00: Enabled. 01: Commands only. 10: Hidden. 

**Colors Enabled**: Bit 3. 0: Disabled. 1: Enabled. 


Client Statuses (0xCD) 
----------------
*Client to Server*

Sent when the client is ready to complete login and when the client is ready to respawn after death. 


Packet ID   | Field Name    | Field Type | Example     | Notes
------------|---------------|------------|-------------|---------------------
0xCD        | Payload       | byte       | 0           | Bit field. 0: Initial spawn, 1: Respawn after death
Total Size: | 2 bytes


Scoreboard Objective (0xCE)
----------------
*Server to Client*

This is sent to the client when it should create a new scoreboard or remove one.  


Packet ID   | Field Name      | Field Type | Example     | Notes
------------|-----------------|------------|-------------|---------------------
0xCE        | Objective name  | string     | deaths      | An unique name for the objective 
            | Objective value | string     | Deaths      | The text to be displayed for the score. 
            | Create/Remove   | byte       | 0           | 0 to create the scoreboard. 1 to remove the scoreboard. 2 to update the display text. TODO: Check these values 
Total Size: | 6 bytes + length of string 


Update Score (0xCF)
----------------
*Server to Client*

This is sent to the client when it should update a scoreboard item. 


Packet ID   | Field Name      | Field Type | Example     | Notes
------------|-----------------|------------|-------------|---------------------
0xCF        | Item Name       | string     | Bob         | An unique name to be displayed in the list. 
            | Update/Remive   | byte       | 0           | 0 to create/update an item. 1 to remove an item. 
            | Score Name      | string     | deaths      | The unique name for the scoreboard to be updated. Only sent when Update/Remove does not equal 1. 
            | Value           | int        | 5           | The score to be displayed next to the entry. Only sent when Update/Remove does not equal 1. 
Total Size: | 9 bytes + length of strings  


Display Scoreboard (0xD0) 
----------------
*Server to Client*

This is sent to the client when it should display a scoreboard. 


Packet ID   | Field Name      | Field Type | Example     | Notes
------------|-----------------|------------|-------------|---------------------
0xD0        | Position        | byte       | 1           | The position of the scoreboard. 0 = list, 1 = sidebar, 2 = belowName. 
            | Score Name      | string     | deaths      | The unique name for the scoreboard to be displayed. 
Total Size: | 4 bytes + length of strings  


Teams (0xD1) 
----------------
*Server to Client*


Creates and updates teams. 


Packet ID   | Field Name        | Field Type       | Example | Notes
------------|-------------------|------------------|---------|---------------------
0xD1        | Team Name         | string           | mcdevs  | A unique name for the team. (Shared with scoreboard). 
            | Mode              | byte             | 0       | See below
            | Team Display Name | string           | McDevs  | Only if Mode = 0 or 2. 
            | Team Prefix       | string           |         | Only if Mode = 0 or 2. Displayed before the players' name that are part of this team.  
            | Team Suffix       | string           |         | Only if Mode = 0 or 2. Displayed after the players' name that are part of this team.  
            | Friendly fire     | byte             | 0       | Only if Mode = 0 or 2; 0 for off, 1 for on, 3 for seeing friendly invisibles 
            | Player count      | short            | 0       | Only if Mode = 0 or 3 or 4. Number of players in the array  
            | Players           | Array of strings |         | Only if Mode = 0 or 3 or 4. Players to be added/remove from the team. 
Total Size: | 4 bytes + length of strings  


**Modes**:

- 0 Team Created
- 1 Team Removed
- 2 Team Information Update
- 3 Add Player
- 4 Remove Player


Plugin Message (0xFA) 
----------------
*Two-Way*


Mods and plugins can use this to send their data. As of 1.3, Minecraft itself uses a number of [plugin channels](Plugin_channel). These internal channels are prefixed with MC|. 


Packet ID   | Field Name        | Field Type | Example           | Notes
------------|-------------------|------------|-------------------|---------------------
0xFA        | Channel           | string     | MyMod:testchannel | Name of the "channel" used to send the data
            | Length            | short      |                   | Length of the following byte array 
            | Data              | byte array |                   | Any data. 
Total Size: | 5 bytes + length of string + length of byte array 


More documentation on this: [http://dinnerbone.com/blog/2012/01/13/minecraft-plugin-channels-messaging/](http://dinnerbone.com/blog/2012/01/13/minecraft-plugin-channels-messaging/ )


Encryption Key Response (0xFC) 
----------------
*Two-Way*


See [Protocol Encryption](Protocol_Encryption) for information on this packet. Bypassing the encryption is possible, authentication for the player name is still needed if the server is in online mode, but instead of sending this packet, you send [Client Statuses](Protocol#client-statuses-0xcd) instead. 

Packet ID   | Field Name           | Field Type | Example | Notes
------------|----------------------|------------|---------|--------
0xFC        | Shared secret length | short      |         | 
            | Shared secret        | byte array |         | 
            | Verify token length  | short      |         | 
            | Verify token         | byte array |         | 
Total Size: | 5 bytes + length of shared secret + length of token


Encryption Key Request (0xFD) 
----------------
*Server to Client*


See [Protocol Encryption](Protocol_Encryption) for information on this packet. 

Packet ID   | Field Name          | Field Type | Example | Notes
------------|---------------------|------------|---------|--------
0xFD        | Server id length    | short      |         | 
            | Server id           | string     |         | 
            | Public key length   | short      |         | 
            | Public key          | byte array |         | 
            | Verify token length | short      |         | 
            | Verify token        | byte array |         | 
Total Size: | 7 bytes + length of string + length of key + length of token 


Server List Ping (0xFE)
----------------
*Client to Server*


This packet is used by the multiplayer menu to retrieve MOTD, version, and player counts. For more info see [Server List Ping](Server_List_Ping) 


Packet ID   | Field Name | Field Type | Example | Notes
------------|------------|------------|---------|--------
0xFE        | Magic      | byte       | 1       | always 1
Total Size: | 2 bytes


Disconnect/Kick (0xFF) 
----------------
*Two-Way*

Sent by the server before it disconnects a client, or by the client before it disconnects from the server. The receiver of this packet assumes that the sender has already closed the connection by the time the packet arrives. 

Due to race conditions in the client, a local server may need to pause for a short period after sending this packet before closing the connection. An alternative is simply not to close the connection, and wait for the client to do so on receipt of this packet. 


Packet ID   | Field Name | Field Type | Example             | Notes
------------|------------|------------|---------------------|--------
0xFF        | Reason     | string     | The server is full! | Displayed to the client when the connection terminates
Total Size: | 3 bytes + length of string

See Also
---------------------------------------------

- [Protocol History](Protocol_History)
- [Data Types](Data_Types)
- [Units of Measurement](Units_of_Measurement)
