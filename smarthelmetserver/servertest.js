var app = require('http').createServer(handler), 
    io = require('socket.io').listen(app);
app.listen(8000);

//io.set('log level', 0);//将socket.io中的debug信息关闭

function handler (req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/plain'
    });
    res.end('Hello World\n');
    console.log('One client is connection.');
}

io.sockets.on('connection', function (socket) {
 //   console.log('One client is connection.');

    socket.emit('Send Loc', { GPSTime: 5 });
    socket.emit('Send Gas',{GASTime:10});

    socket.on('GPS LOC', function (data) {

        console.log('Receiver data.optID is:'+data.optID);
        console.log('Receiver data.dvID is:'+data.dvID);        

    });

    socket.on('disconnect',function(data){
        console.log('One client is exiting.');
    });

});