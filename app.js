
var express = require('express');
var app = express();
var serv = require('http').Server(app);

//var collision = require('/js/collision.js')

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

serv.listen(8080);
console.log('Server Started.');

var SOCKET_LIST = {};

var NUMBER_LIST = [0, 0, 0, 0, 0];

var NewNumber = function() {
	for(var i in NUMBER_LIST) {
		if(NUMBER_LIST[i] == 0){
			NUMBER_LIST[i] = 1;
			return i;
		}
	}
}

var Entity = function() {
	var self = {
		x:0,
		y:0,
		spdX:0,
		spdY:0,
		id:"",
	}
	self.update = function() {
		self.updatePosition();
	}
	self.updatePosition = function() {
		self.x += self.spdX;
		self.y += self.spdY;
	}
	return self;
}

var Player = function(id){
	var self = Entity();
		self.width = 10;
		self.height = 10;
		self.id = id;
		self.number = "" + NewNumber();
		self.pressingRight = false;
		self.pressingLeft = false;
		self.pressingUp = false;
		self.pressingDown = false;
		self.maxSpd = 1;
	
	var  super_update = self.update;
	self.update = function(){
		self.updateSpd();
		super_update();
	}
	
	self.updateSpd = function() {
		if(self.pressingRight)
			self.spdX = self.maxSpd;
		else if(self.pressingLeft)
			self.spdX = -self.maxSpd;
		else
			self.spdX = 0;
		
		if(self.pressingUp)
			self.spdY = -self.maxSpd;
		else if(self.pressingDown)
			self.spdY = self.maxSpd;
		else
			self.spdY = 0;
	}
	
	Player.list[id] = self;
	
	return self;
}

Player.list = {};

Player.onConnect = function(socket) {
	var player = Player(socket.id);
	
	socket.on('keyPress',function(data){
		if(data.inputId === 'left')
			player.pressingLeft = data.state;
		else if(data.inputId === 'right')
			player.pressingRight = data.state;
		else if(data.inputId === 'up')
			player.pressingUp = data.state;
		else if(data.inputId === 'down')
			player.pressingDown = data.state;
	});
}

Player.onDisconnect = function(socket) {
	NUMBER_LIST[Player.list[socket.id].number] = 0;
	delete Player.list[socket.id];
}

Player.update = function() {
	var pack = [];
	for(var i in Player.list){
		var player = Player.list[i];
		player.update();
		pack.push({
			x:player.x,
			y:player.y,
			width:player.width,
			height:player.height,
			number:player.number
		});
	}
	return pack;
}

var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;

	Player.onConnect(socket);
	
	socket.on('disconnect',function(){
		delete SOCKET_LIST[socket.id];
		Player.onDisconnect(socket);
	});
});

setInterval(function(){
	var pack = Player.update();
	
	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.emit('newPositions',pack);
	}
},1000/25);

var deadZones = [[20,20,50,50], [270,270,290,500]]

function addDeadZone(x1, y1, x2, y2){
  deadZones.push([x1,y1,x2,y2])
}

function cleanup(){
  for(i = 0; i < deadZones.length; i++){
    for(k = i; k < deadZones.length; k++){
      if(deadZones[i] == deadZones[k]){
        var temp = deadZones[i]
        removeDeadZone(temp)
        inDeadZone(temp)
      }
    }
  }
}

function removeDeadZone(x1,y1,x2,y2){
  var temp = [x1,y1,x2,y2]
  for(i = 0; i < deadZones.length; i++){
    if(deadZones[i] == temp){
      for(k = deadZones.length-1; k >= i; k--){
        deadZones[k] = deadZones[k-1]
      }
      deadZones.pop()
    }
  }
}

function inDeadZone(x,y){
    for(i = 0; i < deadZones.length; i++){
      if((x >= deadZones[i][0] && x <= deadZones[i][2]) && ((y >= deadZones[i][1] && y <= deadZones[i][3])))
        return true
    }
    return false
}
