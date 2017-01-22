module.exports = {
  var deadZones = [[20,20,50,50], [270,270,290,500]]

  function addDeadZone(x1, y1, x2, y2){
    deadZones.push([x1,y1,x2,y2])
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
}
