require("./avros/src/main.js")
var instance = new AVROS.Serve(80)
instance.AppInformation("Tester")

var cubeId = instance.GenerateId()
var planeId = instance.GenerateId()

var cube = new AVROS.Thing("Cube")

cube.set({
	"id": cubeId,
	"type": "cube",
	"scale": {
		"x": 0.1,
		"y": 0.1,
		"z": 0.02
	}
})

var plane = new AVROS.Thing("Plane")

plane.set({
	"id": planeId,
	"type": "plane",
	"parent": cubeId,
	"scale": {
		"x": 0.1,
		"y": 0.1,
		"z": 0.1
	},
	"position": {
	  "x": 0.0,
	  "y": 0.0,
	  "z": -0.51
	},
    "eulerRotation": {
      "x": 90,
      "y": 180,
      "z": 0
    }
})


const {
  createCanvas,
  loadImage
} = require('canvas')

var width = 500
var height = 500
var canvas = createCanvas(width, height)
var ctx = canvas.getContext('2d')



instance.on("player enter", function(ws) {
  console.log("User " + ws.UserName + " entered")
  instance.SpawnAsInterest(ws, cube)
  instance.DescribeObject(ws, plane)

  instance.AddTag(ws, cube, "Grabable")
  instance.AddTag(ws, cube, "Scalable")

  ctx.fillStyle = "#FFFFFF"
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = "#000000"
  ctx.font = '12px Impact'
  ctx.fillText("VR SOFTWARE BLUEPRINT", 100, 50)
  ctx.fillText("A an astronaut training program that starts from school, people learn controls there.", 30, 80)
  ctx.fillText("Then, higher grade where people learn the basics and advanced astrophysics", 30, 100)
  ctx.fillText("There will be houses and naibourhoods to hang out in", 30, 120)
  ctx.fillText("And for work, a jetpack is taken and lift to space. ", 30, 140)
  ctx.fillText("There will be a mapping of all launchpads and rockets.", 30, 160)
  ctx.fillText("And there will be plots of land on mars, and constructions.", 30, 180)
  
  /*Fathers number 07533665133
  
  'A an astronaut training program that starts from school, people learn controls there.\n'+
'then, you level up and go to a \n'+
'There will be houses and naibourhoods\n'+
'\n'+
'And for work, men take a jetpack and go to space. where there is a mapping of all launchpads and rockets.\n'+
'\n'+
'And there will be plots of land on mars, and constructions\n'+
', 50, 100)'
  */

  loadImage('icons8-space-shuttle-48.png').then(function(img) {
    ctx.drawImage(img, 10, 10, 48, 48)
    instance.SetTexture(ws, plane, canvas)
  })

})