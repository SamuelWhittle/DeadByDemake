var deadZones = []

function addDeadZone(x1, y1, x2, y2){
  deadZones.push([x1,y1,x2,y2])
}

function removeDeadZone(x1,y1,x2,y2){
  var temp = [x1,y1,x2,y2]
  for(i = 0; i < deadZones.length; i++){
    if(deadZones[i] == temp){
      
    }
  }
}
