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

// handle OPTIONS pre-flights
// server.opts(/\.*/, function (req, res, next) {
//   res.send(200);
//   next();
// });

// RESTify routes
server.get('/live', restify.serveStatic({
  directory: '.',
  default: 'index.html'
}));

server.get('/stats', restify.serveStatic({
  directory: '.',
  default: 'stats.html'
}));

var phoneData = {};

//server.post('/startmatch',restify.bodyParser(), restify.queryParser(), startMatch);


io.on('connection', function (socket) {
    console.log('websocket user connected');
    const userid = uuid.v1();
    phoneData[userid] = {};

    //do stuff
    socket.emit('stats', phoneData);

    //Then remove socket.id from cache
    socket.on('disconnect', function (payload) {
        //remove user.id from cache
        // redis.del(socket.handshake.userId, function (err, res) {
        //      console.log('user with socketId: %s & userId: %s disconnected', socket.id, socket.handshake.userId);
        // });
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