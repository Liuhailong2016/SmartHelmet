/**
 * Created by haley on 16-9-2.
 */

var io = require('socket.io-client');
var async = require('async');

var SerialPort = require("serialport");
var serialPort;
var socket;

try{
  serialPort = new SerialPort("/dev/ttyUSB0", {
  baudrate: 9600
  }); 
}catch(er){
  console.log("Open serialport error:"+er);
}

var count = 0;
var startTime;
var endTime;

var gpsRMCStr; //= '$GPRMC, 161229.487, A, 2238.5260, N, 11401.9686, W, 0.13,309.62,,120598,, *10,\r\n';
var gpsRMCJson = require('./protocols/GPS/GPRMC.js');
//解析串口传输的字符串
var serialData = require('./protocols/GPS/ParsSerialData.js');
var gpsLoc;

try{
  socket = io.connect('http://192.168.0.101:8000');
}catch(err){
  console.log("Connect to server error:"+err);
}

/*
socket.on('Send Loc', function (data) {

    async.whilst(
        function(){
          if (count==0)
          {
            startTime =  new Date().getTime();
            console.log('The begin time is:'+startTime);            
          }
          if (count==9)
          {
            endTime =  new Date().getTime();
            console.log('The end time is:'+endTime);
          }
          return count<10;
        },
        function(callback){
//            socket.emit('GPS LOC',{optID:'123',dvID:'456',alt:gpsLoc.Latitude,ult:gpsLoc.Longitude});
            count++;
            setTimeout(callback,1);
        },
        function(err){
           console.log('The second message is end.');
        }

    );

});
*/



serialPort.on('data', function(data) {

//  console.log('data received: ' + data.toString());
  var result = '';
  result = serialData.parSerialData(data.toString());
   console.log('Parse results: ' + result);

  if (result!=null)
    gpsLoc = gpsRMCJson.getRMC(result);
  
  if(gpsLoc == null)
      return;

  //console.log('Data received: ' + gpsLoc.MessageID);

  if(gpsLoc.MessageID == '$GPRMC' && gpsLoc.Status == 'A'){
     console.log('Parse results: ' + gpsLoc.MessageID);
      socket.emit('GPS LOC',{optID:'123',dvID:'456',alt:gpsLoc.Latitude,ult:gpsLoc.Longitude});    
  }

});


