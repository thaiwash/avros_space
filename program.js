require("avros")
var instance = new AVROS.Serve(8088)
instance.AppInformation("AVROS - Space", "icons8-space-48.png")

var cubeId = instance.GenerateId()
var planeId = instance.GenerateId()
var earthId = instance.GenerateId()
var marsId = instance.GenerateId()
var marsTextureId = instance.GenerateId()

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

var MarsTextureView = new AVROS.Thing("MarsTextureView")

MarsTextureView.set({
	"id": marsTextureId,
	"type": "plane",
	"parent": cubeId,
	"scale": {
		"x": 0.06,
		"y": 0.03,
		"z": 0.03
	},
	"position": {
	  "x": 0.0,
	  "y": -0.3,
	  "z": -0.7
	},
    "eulerRotation": {
      "x": 90,
      "y": 180,
      "z": 0
    }
})

var earth = new AVROS.Thing("Earth")

earth.set({
	"id": earthId,
	"type": "sphere",
	"scale": {
		"x": 0.1,
		"y": 0.1,
		"z": 0.1
	}
})

var mars = new AVROS.Thing("Mars")

mars.set({
	"id": marsId,
	"type": "sphere",
	"position": {
	  "x": 0.0,
	  "y": 0.0,
	  "z": 0.0
	},
	"scale": {
		"x": 0.1,
		"y": 0.1,
		"z": 0.1
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

var width = 1000
var height = 500
var marsCanvas = createCanvas(width, height)
var marsCtx = marsCanvas.getContext('2d')


instance.app.get('/lobby', function(req, res) {
  res.send(fs.readFileSync('models/lobby'));
  res.end();
})


instance.on("user enter", function(ws) {
  console.log("User " + ws.UserName + " entered")
  instance.SpawnAsInterest(ws, cube)
  instance.DescribeObject(ws, plane)
  instance.DescribeObject(ws, MarsTextureView)
  console.log("Mars texture")
  //instance.SpawnAsInterest(ws, earth)
  instance.SpawnAsInterest(ws, mars)

  instance.AddTag(ws, cube, "Grabable")
  instance.AddTag(ws, cube, "Scalable")
  instance.AddTag(ws, plane, "Raycast")
  
  instance.AddTag(ws, earth, "Grabable")
  instance.AddTag(ws, earth, "Scalable")
  instance.AddTag(ws, earth, "Raycast")
  
  instance.AddTag(ws, mars, "Grabable")
  instance.AddTag(ws, mars, "Scalable")
  instance.AddTag(ws, mars, "Raycast")

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
  
  ctx.fillText("Todo:", 30, 220)
  ctx.fillText("- Mysql object position memory, to reload object position after reconnect X", 30, 240)
  ctx.fillText("- Syncronization Pulse V", 30, 260)
  ctx.fillText("- Object Rationalization X", 30, 280)
  


  function drawLine(ctx, x1, y1, x2,y2, stroke = 'black', width = 3) {
	// start a new path
	ctx.beginPath();

	// place the cursor from the point the line should be started 
	ctx.moveTo(x1, y1);

	// draw a line from current cursor position to the provided x,y coordinate
	ctx.lineTo(x2, y2);

	// set strokecolor
	ctx.strokeStyle = stroke;

	// set lineWidht 
	ctx.lineWidth = width;

	// add stroke to the line 
	ctx.stroke();
  }
  
  marsCtx.fillStyle = "#FFFFFF"
  marsCtx.fillRect(0, 0, width, height)
  
  drawLine(marsCtx, 0, 100, 500, 100, 'black', 3);
  
	  
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
    //instance.SetTexture(ws, mars, canvas)
  })
  
  loadImage('img/mars_texture.png').then(function(img) {
    marsCtx.drawImage(img, 0, 0, 1000, 500)
	instance.SetTexture(ws, mars, marsCanvas)
	instance.SetTexture(ws, MarsTextureView, marsCanvas)
  })
  
  

})