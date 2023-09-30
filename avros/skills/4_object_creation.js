require("../src/main.js")
var instance = new AVROS.Serve(80)
instance.AppInformation("Tester")

var thing = new AVROS.Thing("My thing")

thing.set({
  "type": "cube",
  "scale": {
    "x": 0.1,
    "y": 0.1,
    "z": 0.1
  }
})

console.log(thing.getSocket())
instance.on("player enter", function(ws) {
  console.log("Player " + ws.userName + " entered")
  

  console.log(thing.name)
  instance.SpawnAsInterest(ws, thing)
})
