var express = require("express");
var fs = require('fs');
var http = require('http');
var path = require('path');
var io;


var app = express();
app.set('port', 3456);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Serve up our static resources
app.get('/', function(req, res) {
  fs.readFile('./public/index.html', function(err, data) {
    res.end(data);
  });

});
var ser = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
  
  setSocket();

});
function setSocket(){
	io = require('socket.io')(ser);
	console.log("Setting up Client-Server communication");
	
	io.on('connection', function (socket) {
		
		// get client address
		var address = socket.handshake.address;
		// create id to send to client
		var clientId = new Date().getTime().toString();
		console.log(clientId);

		console.log("Connection Established");

        ////////////////////////////
        outputFile = "./recordings/" + clientId.toString() + ".csv";
        fs.appendFile(outputFile, "chunk,timestamp,mouseX,mouseY,colour,mode,size\n", function(err){
			if(err){
				console.log(err);
			}
			else
				console.log("worked");
		});

        //////////////////// socket API /////////////////////////////////////////
        socket.on("lineStop", function(socketData){
            var dataToSave="";

            socketData.timestamp.forEach(function(e,i){
                dataToSave += socketData.chunk[i].toString()+','+
                             socketData.timestamp[i].toString()+','+
                             socketData.mouseX[i].toString()+','+
                             socketData.mouseY[i].toString()+','+
                             socketData.color[i].toString()+','+
                             socketData.mode[i].toString()+','+
                             socketData.size[i].toString()+'\n'
            })
            

            outputFile = "./recordings/" + clientId.toString() + ".csv";
			console.log("Output file is: ",outputFile);
			
			////////////////////////
			fs.appendFile(outputFile, dataToSave, function(err){
                if(err){
                    console.log(err);
                }
                else
                    console.log("worked");	
            });
        });

	});
}
