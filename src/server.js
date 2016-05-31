// restify + socket.io
var restify = require('restify'),
    socketio = require('socket.io'),
    server = restify.createServer(),
    io = socketio.listen(server.server),
    _ = require('lodash');

var fileUtils = require('./utils/fileUtils.js');
var registeredPlayers = fileUtils.loadJSON("data/players.json");

// redis for storing socket.io clients
var uuid = require('node-uuid');
var mkdirp = require('mkdirp');


var currentMatchData = null;

// file-handling stuff
var fs = require('fs'),
    zip = new require('node-zip')();


// for retrieving full responses
server.use(restify.fullResponse())
// enable cross origin access
server.use(restify.CORS({
    origins: ['http://localhost:8000'],   // defaults to ['*']
    credentials: true,                 // defaults to false
    headers: ['Authorization']                 // sets expose-headers
}));

// handle OPTIONS pre-flights
server.opts(/\.*/, function (req, res, next) {
  res.send(200);
  next();
});

// RESTify routes
server.post('/startmatch',restify.bodyParser(), restify.queryParser(), startMatch);
server.post('/updatematch',restify.bodyParser(), restify.queryParser(), updateMatch);
server.post('/registerPlayer',restify.bodyParser(), restify.queryParser(), registerPlayer);

// io.use(function(socket,next){
//   var userId = uuid.v1();
//   //socket.handshake.userId = userId;
//   // redis.set(userId, socket.id, function (err, res) {
//   //   console.log("--->",userId)
//   //   next();
//   // });

// });

// socket.io connection
// io.sockets.on('connection', function (socket,next) {
//     console.log("\n","oh, someone connected...");
//     var userId = uuid.v1();
//     console.log("i will call u ", userId, '\n');
//     socket.handshake.userId = userId;
//     redis.set(userId, socket.id, function (err, res) {
//          //next();
//     });
// });

io.on('connection', function (socket) {
    console.log('websocket user connected');


    //do stuff
    //socket.emit('connection.response', {userId:socket.handshake.userId,socketId:socket.id});
    if(currentMatchData != null){
      socket.emit("match.update",currentMatchData);
    }
    socket.emit("players.update",registeredPlayers);

    //Then remove socket.id from cache
    socket.on('disconnect', function (payload) {
        //remove user.id from cache
        // redis.del(socket.handshake.userId, function (err, res) {
        //      console.log('user with socketId: %s & userId: %s disconnected', socket.id, socket.handshake.userId);
        // });
    });
});


function saveMatch(matchData){
  var playerA = matchData.playerA.name,
      playerB = matchData.playerB.name,
      matchId = matchData.matchId;

  var matchFolder = playerA+"_VS_"+playerB+"_"+matchId,
      folder = "matches/"+matchFolder+"/",
      fileName = new Date().toString();

  fileUtils.saveFile(folder,fileName,".json",function(err){
    console.log(err);
  });
}

function startMatch(req,res,next){
  var data = JSON.parse(req.body.data);
  data.matchId = uuid.v1();
  data.startTime = new Date().toString();
  var playerA = data.playerA.name,
      playerB = data.playerB.name,
      matchId = data.matchId;

  var matchFolder = playerA+"_VS_"+playerB+"_"+matchId;
  io.emit('match.update',data);

  fileUtils.mkdir('matches/'+matchFolder,function(err){
    if(!err){
      currentMatchData = data;
      //saveMatch(data);
    }else{
      console.log(err);
    }
  });
}

function updateMatch(req,res,next){
  var data = JSON.parse(req.body.data);
  io.emit('match.update',data);
  currentMatchData = data;
  res.send("success");
  next();
  //saveMatch(data);
}

function registerPlayer(req,res,next){
  var playerData = JSON.parse(req.body.data);
  res.send("success");
  next();
  var matches = _.filter(registeredPlayers,function(player){
    return player.name == playerData.name || player.short == playerData.short;
  });

  if(matches.length > 0){
    return;
  }
  registeredPlayers.push(playerData);
  io.emit('players.update',registeredPlayers);


  fileUtils.saveFile("registered_players","data/",".json",JSON.stringify(registeredPlayers), function(err){
    console.log(err);
  });
}


function setResponseHeaders(res, filename) {
  res.header('Content-disposition', 'inline; filename=' + filename);
  res.header('Content-type', 'application/zip');
}

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
  console.log("########################");
  console.log("registered players:");
  console.log("########################");
  for(var i = 0; i < registeredPlayers.length; i++){
    console.log(registeredPlayers[i]);
  }
  console.log("########################");

});