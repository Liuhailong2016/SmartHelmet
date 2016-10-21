var app = require('http').createServer(handler), 
    io = require('socket.io').listen(app);

var config = require('./config')['development'];
var Sequelize = require('sequelize');
var dbStroage = new Sequelize(config.database, config.username, config.password, config.option);
var DeviceRecord = dbStroage.import(__dirname + "/models/DeviceRecord");
//标准GPS坐标（WGS84）转换为百度坐标（BD09）
var transData = require('./protocols/GPS/GPS2BDMap.js');

var count = 0;
var starttime;
var endtime;

DeviceRecord.sync();

app.listen(8000);

//io.set('log level', 0);//将socket.io中的debug信息关闭

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',function (err, data) {  
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }    
    res.writeHead(200, {'Content-Type': 'text/html'});    
    res.end(data);
  });
}


io.sockets.on('connection', function (socket) {
    socket.emit('Send Loc', { GPSTime: 5 });
    socket.emit('Send Gas',{GASTime:10});

    socket.on('GPS LOC', function (data) {
        //GPS坐标转换为百度BD09坐标
        var tranGps = transData.gPS2BDLoc(data.lat,data.lon);

    DeviceRecord.build({
    TenantID : 'td987654321',
    DeviceSerialNO : 'ISN1234567890',
    DeviceTypeID : 'Helmet',
    DeviceNo : data.dvID,
    BurnCode : 'RWID4567890',
    UserID : data.optID,
    LongitudeW84 : data.ult,
    LatitudeW84 : data.alt,
    LongitudeBD09 : tranGps.ult,
    LatitudeBD09 : tranGps.alt,

    WriteTime : Date.now()    
    }).save().then(function() {
        if(count == 0)
            starttime = new Date().getTime();
        else if(count = 999)
        {
            console.log('Start time is:'+starttime);
            console.log('End time is:'+new Date().getTime());
        }
        count++;            
        console.log('Data successfully inserted');
        }).catch(function(error) {
        console.log('Error in Inserting Record'+error);
        });

    });

    socket.on('disconnect',function(data){
        console.log('One client is exiting.');
    });

});