
const { createCanvas, loadImage } = require('canvas')

var canvasWidth = 500;
var canvasHeight = 500;

var window = {
    innerWidth: canvasWidth,
    innerHeight: canvasHeight

};
var document = {
    createElement: function(name) {
        if (name == "canvas") {
            //return new Canvas(canvasWidth, canvasHeight);
        }
        return createCanvas(1000, 1000)
    },
    createElementNS: function(name) {

        return createCanvas(1000, 1000)
    }
};


var fs = require("fs")
var THREE = require("./threejs/three.js")
const PublicMethods = require('./PublicMethods.js')
eval(fs.readFileSync(__dirname + "/threejs/additionalRenderers.js").toString())
eval(fs.readFileSync(__dirname + "/threejs/SceneUtils.js").toString())
const express = require('express')


/*
c# warn: controller sphere registeres with wrong id
c# warn: opening multiple sockets
c# todo: undepricate user_id so playser acn leave gracefully
*/

class AVROS extends PublicMethods {
	constructor() {

        super()
		this.THREE = THREE
        var self = this

		this.showLog = false
		this.players = {}
		this.entanglements = []
		this.requiredTasks = []
		this.personal = [
			"Main Menu",
			"Keyboard",
			"Desktop Mirror"
		]

		this.personalObjectDefinitions = {
			"Main Menu": "cube",
			"Main MenuMainPlane": "plane",
			"Main MenuBackPlane": "plane",
			"Keyboard": "mesh",
			"Desktop Mirror": "cube",
			"Main MenuMainPlane": "plane",
			"Main MenuBackPlane": "plane"
		}

		/* move to object property
		this.textureUpdateInterval = setInterval(function() {
			self.textureUpdate()
		}, 1000)
		*/

		this.loadState()

		this.saveFile = setInterval(function() {
			self.saveState()
		}, 3000)
	}

	systemMessage(msg) {
		this.emit('system message', msg)
		if (this.showLog) {
			console.log(msg)
		}
	}

	loadState() {
		var saveFile = process.cwd() + "/save/saveFile.json";

		if (!fs.existsSync(process.cwd() + "/save")) {
			fs.mkdirSync(process.cwd() + "/save");
		}
		if (!fs.existsSync(process.cwd() + "/save/saveFile.json")) {
			fs.writeFileSync(saveFile, "{}");
		}
		try {
			var saveData = JSON.parse(fs.readFileSync(saveFile).toString())
		} catch(e){
			if (e.message == "Unexpected end of JSON input") {
				fs.writeFileSync(saveFile, "{}")
				return
			}
		}


		if (!isVoid(saveData.players)) {
			this.players = saveData.players
		}
		if (!isVoid(saveData.requiredTasks)) {
			this.requiredTasks = saveData.requiredTasks
		}
	}

	saveState() {
		var savefile = process.cwd() + "/save/saveFile.json";

		var saveData = {
			players: this.players,
			requiredTasks: this.requiredTasks
		}
		fs.writeFile(savefile, JSON.stringify(saveData), function() {})
	}

	open(port) {
        var self = this


		this.app = express()

		this.app.use(express.static(__dirname + '/public'))

		this.app.get('/players', function(req, res) {
			res.send(JSON.stringify(self.players, 0, 4));
			res.end();
		})
		var server = require('http').createServer(this.app);
		/*
		this.app = require('http').createServer(function (req, res) {
			if (fs.existsSync("./public"+req.url)) {
				if (!fs.lstatSync("./public"+req.url).isDirectory()) {
					res.write(fs.readFileSync("./public"+req.url));
					res.end();
				}
			}

			if (req.url == "/") {
				res.write(fs.readFileSync("./public/index.html"));
				res.end();
			}

			if (req.url == "/players") {
				res.write(JSON.stringify(self.players, 0, 4));
				res.end();
			}
			if (req.url == "/entanglements") {
				res.write(JSON.stringify(self.entanglements, 0, 4));
				res.end();
			}
		})*/

		this.io = require('socket.io')(server);

		server.listen(port);

		this.io.on('connection', function(socket) {
			self.systemMessage("server: connection detected")
			self.initSocket(socket)
		})


		console.log("server: AVROS server listening on port "+ port)
		self.initTimers()
	}


	initTimers() {
        var self = this
		this.socketCleanupInterval = setInterval(function() {
			self.socketCleanup()
		}, 10000)

		this.rationalizationInterval = setInterval(function() {
			self.rationalizeObjects()
		}, 3000)
		/*
		this.bindScanInterval = setInterval(function() {
			self.bindScan()
		}, 1000)
		this.entanglementSyncInterval = setInterval(function() {
			self.entanglementSync()
		}, 3000)*/
	}

	socketCleanup() {
		var sockets = this.io.sockets.clients()
		//console.log(Object.keys(sockets))
		var keys = Object.keys(sockets["sockets"])

		var connectedPlayers = []
		for (var i = 0; i < keys.length; i ++) {
			//(sockets[keys[i]])
			//console.log(keys[i])
			//console.log(Object.keys(sockets["sockets"][keys[i]]))
			//console.log(sockets["sockets"][keys[i]].playerName)

			//console.log(sockets["sockets"][keys[i]].playerName)

			if (isVoid(sockets["sockets"][keys[i]].playerName)) {
				this.systemMessage("server: Unidentified socket disconnected")
				sockets["sockets"][keys[i]].disconnect()
				continue
			} else {
				connectedPlayers.push(sockets["sockets"][keys[i]].playerName)
			}
			/*
			if (this.players[sockets["sockets"][keys[i]].playerName].socket.id != keys[i]) {
				console.log("server: Socket id mismash, smash")
				sockets["sockets"][keys[i]].disconnect()
			}*/
		}

		var playerNames = Object.keys(this.players)
		for (var i = 0; i < playerNames.length; i ++) {
			if (connectedPlayers.indexOf(playerNames[i]) == -1) {
				//this.removePlayerOwnedObjects(playerNames[i])
				delete(this.players[playerNames[i]])
			}
		}
		this.systemMessage("server: no sockets "+ keys.length + " "+Object.keys(this.players))
	}
	/*
	removePlayerOwnedObjects(playerName) {
		var playerNames = Object.keys(this.players)
		for (var i = 0; i < playerNames.length; i ++) {
			for (var i2 = 0; i2 < this.players[playerNames[i]].objects.length; i2 ++) {
				if (!isVoid(this.players[playerNames[i]][i2].owner)) {
				if (!isVoid(this.players[playerNames[i]][i2].owner)) {
					if (this.players[playerNames[i]][i2].owner == playerName) {
						this.deleteObject(this.players[playerNames[i]][i2])

					}
				}
				}
			}
		}
	}*/

	deleteObject(socket, obj) {
		socket.emit("object destroyed", obj)
	}

	isSimilar(obj1, obj2) {

		if (isVoid(obj1)) {
			return false
		}
		if (isVoid(obj2)) {
			return false
		}
		var keys = Object.keys(obj1)
		for (var i = 0; i < keys.length; i ++) {
			if (keys[i] == "object_id") {
				continue
			}
			if (keys[i] == "syncTime") {
				continue
			}
			if (isVoid(obj2[keys[i]])) {
				return false
			}
			if (obj1[keys[i]] != obj2[keys[i]]) {
				return false
			}
		}
		return true
	}


	// check for missing objects
	// check that all objects are similiar on all sovkets
	// check for no missing player owned objects


	rationalizeObjects() {

		var objs = this.allObjects()
		var playerNames = Object.keys(this.players)
		for (var i = 0; i < playerNames.length; i ++) {
			for (var i2 = 0; i2 < this.players[playerNames[i]].objects.length; i2 ++) {
				var obj = this.players[playerNames[i]].objects[i2]

				// check if object belongs to a disconnected player
				if (!isVoid(this.players[playerNames[i]].objects[i2].owner)) {
					if (isVoid(this.getPlayerSocket(obj.owner))) {
						this.systemMessage("server: player "+playerNames[i]+ " is disconnected. "+obj.name+ " will be deleted")
						//this.getPlayerSocket(playerNames[i]).emit("object destroyed", obj)

						this.requiredTasks.push({
							"target": playerNames[i],
							"action": "object destroyed",
							"object": obj
						})

						this.players[playerNames[i]].objects.splice(i2, 1)
						i2 = 0
					}
				}


				if (!isVoid(obj.type)) {
					for (var i3 = 0; i3 < playerNames.length; i3 ++) {


						// check for object existance
						var found = false

						for (var i4 = 0; i4 < this.players[playerNames[i3]].objects.length; i4 ++) {
							var obj2 = this.players[playerNames[i3]].objects[i4]
							if (obj.name == obj2.name) {
								var found = true
							}

							// check for OOS
							if (obj.object_id == obj2.object_id) {
								if (!this.isSimilar(obj, obj2)) {

									if (obj.syncTime > obj2.syncTime) {
										this.systemMessage("player "+playerNames[i3]+ " object "+obj2.name+ " is out of sync")
									    //this.getPlayerSocket(playerNames[i3]).emit("object changed", obj)
										this.requiredTasks.push({
											"target": playerNames[i3],
											"action": "object changed",
											"object": obj2
										})
									} else {
										this.systemMessage("player "+playerNames[i]+ " object "+obj.name+ " is out of sync")
										//this.getPlayerSocket(playerNames[i]).emit("object changed", obj2)
										this.requiredTasks.push({
											"target": playerNames[i],
											"action": "object changed",
											"object": obj2
										})
									}
								}
							}
						}
						if (!found) {
							this.systemMessage("player "+playerNames[i3]+ " is missing object "+obj.name)
							if (isVoid(this.getPlayerSocket(playerNames[i3]))) {
								this.systemMessage("warning: player "+playerNames[i3]+ " is missing a socket")
							}
							this.systemMessage(obj)
							//this.getPlayerSocket(playerNames[i3]).emit("object changed", obj)
							this.requiredTasks.push({
								"target": playerNames[i3],
								"action": "object changed",
								"object": obj
							})
						}

					}
				}
			}
		}

		this.requiredTasks.sort(function(a, b) {
			return a.object.syncTime - b.object.syncTime;
		})


		this.systemMessage("nothing to sane")
	}

	syncObjectWith(obj, master) {
		var newObj = master
		newObj.object_id = obj.object_id
		this.io.sockets.emit("object changed", newObj)
		return newObj
	}

  	registerObject(socket, data) {
      //onsole.assert(isVoid(socket), "socket is void")
  		if (isVoid(socket)) {
  			return
  		}

  		if (data.name.search("Controller") == -1 && data.name.search("Camera") == -1) {
  			this.systemMessage("server "+socket.playerName+" registered object " + data.name + " " + data.object_id)
  		}
  		this.emit("object changed", data)

  		data.syncTime = (new Date()).getTime()

  		var objs = this.players[socket.playerName].objects
  		for (var i = 0; i < objs.length; i ++) {
  			if (objs[i].object_id == data.object_id) {
  				objs[i] = data
  				return
  			}
  		}
  		this.players[socket.playerName].objects.push(data)

  	}

    	changeObject(socket, data) {
    		if (isVoid(socket.playerName)) {
    			return
    		}

    		if(isVoid(this.players[socket.playerName])){
    			this.systemMessage("server: warning; syncing before inited")
    			return
    		}
    		//console.log("server "+socket.playerName+" registered object " + data.name + " " + data.object_id)

    		if (data.type != "") {
    			// let server handle syncing
    			//socket.broadcast.emit("object changed", data)
    		}

    		this.registerObject(socket, data)
    	}

	initSocket(socket) {
        var self = this
		this.systemMessage("server: connection detected")

        socket.inited = false
		socket.on("syncronization event", function(data) {
			//console.log("server: sync ")
			//console.log(JSON.stringify(data, 0, 4))
			if (isVoid(data)) {
				self.systemMessage("server: bad client dsconnected")
				socket.disconnect()
				return
			}
			self.syncEvent(socket, data)
			self.emit("player update", socket.playerName)
			clearTimeout(self.players[socket.playerName].syncTimer)
			setTimeout(function() {
				socket.emit("syncronization event callback")
			}, 100)
        })

        socket.on("object changed", function(data) {
            self.changeObject(socket, data)
        })

        socket.on("object registered", function(data) {
            self.changeObject(socket, data)
        })

		this.systemMessage("server: who are you")
		socket.emit("who are you")
		socket.on("i am", function (data) {
			socket.playerName = data["playerName"]
			socket.emit("connection accepted")
			socket.emit("syncronization event callback")
			self.systemMessage(data["playerName"] + " identified")

		})

        socket.on("name changed", function(data) {
			socket.playerName = data["playerName"]
        })


		socket.on('disconnect', function(obj) {
			self.systemMessage(socket.playerName+" left the server")
			delete(self.players[socket.playerName])
		})
	}

	syncEvent(socket, data) {
		var name = socket.playerName
        var self = this

		var player = this.parseSyncData(data["data"])

		var controllerDistraction = 0

		var firstConnect = false

		if (isVoid(this.players[name])) {

			socket.syncTimeout = setTimeout(function() {
				socket.emit("syncronization event callback")
				self.syncEvent(socket, data)
			}, 0)

            socket.playerName = name

            player.leftController.object_id = this.generateId()
            player.rightController.object_id = this.generateId()
            player.head.object_id = this.generateId()
            player.objects = []

			self.systemMessage("server: "+name+" connected")
			firstConnect = true
		} else {
            player.objects = this.players[name].objects
			player.leftController.object_id = this.players[name].leftController.object_id
			player.rightController.object_id = this.players[name].rightController.object_id
			player.head.object_id = this.players[name].head.object_id
		}

		var evt = {
			"object_id": player.leftController.object_id.toString(),
			"type": "sphere",
			"scaleX": "0.04500",
			"scaleY": "0.04500",
			"scaleZ": "0.04500",
			"posX": (player.leftController.position.x + controllerDistraction).toString(),
			"posY": player.leftController.position.y.toString(),
			"posZ": player.leftController.position.z.toString(),
			"name": name+"LeftController",
			"owner": name
		}
		//socket.emit("object changed", evt)
		//socket.broadcast.emit("object changed", evt)

		var evt2 = {
			"object_id": player.rightController.object_id.toString(),
			"type": "sphere",
			"scaleX": "0.04500",
			"scaleY": "0.04500",
			"scaleZ": "0.04500",
			"posX": (player.rightController.position.x + controllerDistraction).toString(),
			"posY": player.rightController.position.y.toString(),
			"posZ": player.rightController.position.z.toString(),
			"name": name+"RightController",
			"owner": name
		}
		//console.log(evt2.name)
		//socket.emit("object changed", evt2)
		//socket.broadcast.emit("object changed", evt2)

		var evt3 = {
			"object_id": player.head.object_id.toString(),
			"type": "sphere",
			"scaleX": "0.04500",
			"scaleY": "0.04500",
			"scaleZ": "0.04500",
			"posX": player.head.position.x.toString(),
			"posY": player.head.position.y.toString(),
			"posZ": player.head.position.z.toString(),
			"rotX": player.head.rotation._x.toString(),
			"rotY": player.head.rotation._y.toString(),
			"rotZ": player.head.rotation._z.toString(),
			"rotW": player.head.rotation._w.toString(),
			"name": "PlayerCamera",
			"owner": name
		}
		//console.log(evt3.name)
		//socket.emit("object changed", evt2)
		//socket.broadcast.emit("object changed", evt3)


		this.players[name] = player

		if (firstConnect) {
			self.emit('player entered', name);
		}
    }

    parseSyncData(data) {
		if (isVoid(data)) {
			this.systemMessage("server: sync data is void")
			return
		}
        var parse = data.split("|")
        var values = [];
        for (var i = 0; i < parse.length; i ++) {
            var chop = parse[i].replace("(", "")
            chop = chop.replace(")", "")
            chop = chop.replace(" ", "")
            chop = chop.replace(" ", "")
            chop = chop.replace(" ", "")
            chop = chop.replace(" ", "")
            values.push(chop.split(","))
        }
        var user = {}
        user.head = {}
        user.head.position = new THREE.Vector3(
            parseFloat(values[0][0]),
            parseFloat(values[0][1]),
            parseFloat(values[0][2])
        )
        user.head.rotation = new THREE.Quaternion(
            parseFloat(values[1][0]),
            parseFloat(values[1][1]),
            parseFloat(values[1][2]),
            parseFloat(values[1][3])
        )
        user.rightController = {}
        user.rightController.position = new THREE.Vector3(
            parseFloat(values[2][0]),
            parseFloat(values[2][1]),
            parseFloat(values[2][2])
        )
        user.rightController.rotation = new THREE.Quaternion(
            parseFloat(values[3][0]),
            parseFloat(values[3][1]),
            parseFloat(values[3][2]),
            parseFloat(values[3][3])
        )
        user.leftController = {}
        user.leftController.position = new THREE.Vector3(
            parseFloat(values[4][0]),
            parseFloat(values[4][1]),
            parseFloat(values[4][2])
        )
        user.leftController.rotation = new THREE.Quaternion(
            parseFloat(values[5][0]),
            parseFloat(values[5][1]),
            parseFloat(values[5][2]),
            parseFloat(values[5][3])
        )

        user.rightController.grabberId = parse[6]
        user.leftController.grabberId = parse[7]

		    return user
    }

  	generateId() {
    		var min=1;
    		var max=100000;
    		return Math.floor(Math.random() * (+max - +min)) + +min;
  	}
}

function isVoid(variable) {
	if (typeof variable === "undefined") {
        return true
	}
    return false
}

module.exports = new AVROS()
