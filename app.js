
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
var PLAYER_LIST = {};

var NUMBER_LIST = [0, 0, 0, 0, 0];

var NewNumber = function() {
	for(var i in NUMBER_LIST) {
		if(NUMBER_LIST[i] == 0){
			NUMBER_LIST[i] = 1;
			return i;
		}
	}
}

//var playerNumber = NewNumber();

var Player = function(id){
	var self = {
		x:250,
		y:250,
		id:id,
		number:"" + NewNumber(),
		pressingRight:false,
		pressingLeft:false,
		pressingUp:false,
		pressingDown:false,
		maxSpd:1,
	}

	self.updatePosition = function(){
		if(self.pressingRight && !inDeadZone(self.x+self.maxSpd, self.y))
			self.x += self.maxSpd;
		if(self.pressingLeft && !inDeadZone(self.x-self.maxSpd, self.y))
			self.x -= self.maxSpd;
		if(self.pressingUp && !inDeadZone(self.x, self.y-self.maxSpd))
			self.y -= self.maxSpd;
		if(self.pressingDown && !inDeadZone(self.x, self.y+self.maxSpd))
			self.y += self.maxSpd;
	}
	return self;
}

var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;

	var player = Player(socket.id);
	PLAYER_LIST[socket.id] = player;

	socket.on('disconnect',function(){
		NUMBER_LIST[PLAYER_LIST[socket.id].number] = 0;
		delete SOCKET_LIST[socket.id];
		delete PLAYER_LIST[socket.id];
	});

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

});

setInterval(function(){
	var pack = [];
	for(var i in PLAYER_LIST){
		var player = PLAYER_LIST[i];
		player.updatePosition();
		pack.push({
			x:player.x,
			y:player.y,
			number:player.number
		});
	}

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
