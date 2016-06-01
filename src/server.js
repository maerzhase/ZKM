// restify + socket.io
var restify = require('restify'),
    socketio = require('socket.io'),
    server = restify.createServer(),
    io = socketio.listen(server.server);

var uuid = require('node-uuid');


// for retrieving full responses
server.use(restify.fullResponse())
// enable cross origin access
server.use(restify.CORS({
    origins: ['http://localhost:8000'],// defaults to ['*']
    credentials: true,                 // defaults to false
    headers: ['Authorization']         // sets expose-headers
}));


// RESTify routes
server.get('/live', restify.serveStatic({
  directory: './public/',
  file: 'index.html'
}));

server.get('/stats', restify.serveStatic({
  directory: './public/',
  file: 'stats.html'
}));

server.get('/render.js', restify.serveStatic({
  directory: './public/',
  file: 'render.js'
}));

var phoneData = {};

//server.post('/startmatch',restify.bodyParser(), restify.queryParser(), startMatch);


io.on('connection', function (socket) {
  
  socket.on('register_live', function (data) {
    
    const userid = uuid.v1();
    phoneData[userid] = {};
    
    io.emit('stats', phoneData);
    
    socket.on('update', function (data) {
      phoneData[userid] = data;
      io.emit('stats', phoneData);
    });

    socket.on('disconnect', function (payload) {
      delete phoneData[userid];
      io.emit('stats', phoneData);
    });
  });

  socket.on('register_stats', function (data) {
    console.log("stats reg");
    io.emit('stats', phoneData);
  });
});

function registerUser(req,res,next){
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

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
  console.log("########################");
});
