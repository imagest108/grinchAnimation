var http = require("http");
var fs = require("fs");
var httpServer = http.createServer(requestHandler);
httpServer.listen(8080);

function requestHandler (req, res){

        fs.readFile(__dirname + '/index.html',
                function (err, data) {
                        if (err) {
                                res.writeHead(500);
                                return res.end('Error loading index.html');
                        }

                        res.writeHead(200);
                        res.end(data);
                });
}

var displaygroup = [];
var endingDisplaygroup = []
var controller = null;

var io = require('socket.io').listen(httpServer);

io.sockets.on('connection', function (socket){

	console.log("We have a new client: " + socket.id);

	socket.on('register', function(data){
		console.log(data);
		if( data === "display"){
            //console.log("display socket found in server side");            
            
			if(displaygroup.length < 3){				
				var tempData = { 
					id: socket.id, 
					index: displaygroup.length+1,
					role: data 
				};
				
				displaygroup.push(tempData);
				io.sockets.socket(displaygroup[displaygroup.length-1].id).emit('render', tempData);

			}else{
				//make socket disconnect!
				console.log("you shouldn't be here!");
				console.log("displaysockets are "+ displaygroup.length);
			}
		}else if(data === "controller"){
			
			if(controller === null){				
				tempData = { 
					id: socket.id, 
					index: 9999,
					role: data 
				};
			
				controller = tempData;
				console.log("Controller is ready!");

				io.sockets.socket(socket.id).emit('render', tempData);
				io.sockets.socket(displaygroup[1].id).emit('playAudio', {music: 'bgm'});
		
				
			}else{
				//make socket disconnect!
			}

		} else if(data === "ending"){
			if(endingDisplaygroup.length < 3){				
				var tempData = { 
					id: socket.id, 
					index: endingDisplaygroup.length+1,
					role: data 
				};
				
				endingDisplaygroup.push(tempData);
				io.sockets.socket(endingDisplaygroup[endingDisplaygroup.length-1].id).emit('render', tempData);

			}else{
				//make socket disconnect!
			}

		}		

	});

	socket.on('trigger', function(data)	{

		for(var i = 0; i < displaygroup.length ; i++ ){
			io.sockets.socket(displaygroup[i].id).emit('sceneChange', data);	
		}
		

	});

	socket.on('disconnect', function() {
		console.log("Client has disconnected");
	});

});
