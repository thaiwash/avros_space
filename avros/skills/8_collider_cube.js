require("../src/main.js")
var instance = new AVROS.Serve(8080)
instance.AppInformation("Tester")

var cubeId = instance.GenerateId()

var cube = new AVROS.Thing("Cube")

cube.set({
	"id": cubeId,
	"type": "cube",
	"scale": {
		"x": 0.1,
		"y": 0.1,
		"z": 0.1
	}
})

console.log("Move your controller inside the cube")



instance.on("player enter", function(ws) {
    console.log("Player " + ws.userName + " entered")
    instance.SpawnAsInterest(ws, cube)
    ws.send('HeadText|{"say": "Hello from server"}');
})

var colored = true
instance.on("player update", function(ws) {

  if (isVoid(instance.GetObjectById(cube.id))) {
    console.log("not found")
    return
  }
  console.log(instance.GetObjectById(cube.id))
  console.log(instance.GetObjectById(cube.children[0].id))
  var obj = instance.Tier0ToTier2(instance.GetObjectById(cube.id))
  var obj2 = instance.Tier0ToTier2(instance.GetObjectById(cube.children[0].id))
  //console.log(obj)
  //console.log(obj2)

  //  console.log(instance.IsWithinCube(instance.players[player].rightController, obj2, obj))
  if (instance.IsWithinCube(instance.players[player].rightController, obj2, obj)) {
    if (!colored) {
      colored = true
      instance.SetColor(cube.children[0].id, "#0000ff")
    }
  } else {
    if (colored) {
      colored = false
      instance.SetColor(cube.children[0].id, "#ffffff")
    }
  }
})
