//定义GPS串口
var SerialPort = require("serialport");
var serialPort;
try{
//  serialPort = new SerialPort("COM4", {
  serialPort = new SerialPort("/dev/ttyUSB0", {
  baudrate: 9600
  }); 
}catch(er){
  console.log("Open serialport error:"+er);
}

var gpsRMCStr; //= '$GPRMC, 161229.487, A, 2238.5260, N, 11401.9686, W, 0.13,309.62,,120598,, *10,\r\n';
var gpsRMCJson = require('./protocols/GPS/GPRMC.js');
//解析串口传输的字符串
var serialData = require('./protocols/GPS/ParsSerialData.js');
var gpsLoc;

//定义GPRS串口
var SIM900 = require('./gprs');

//var s = new SIM900("COM5",9600);
 var s = new SIM900("/dev/ttyUSB1",9600);
    s.status(function(err, res) {
       if(err) return console.log('Error getting status', err);
        console.log('Status return', res);
    });

var GPSData = {"DataType":"GPSLOC","GPSLOC":{"alt":40.041928,"ult":116.310430}};

function psdata(){

    s.HTTPPost('http://59.108.126.38:8000',JSON.stringify(GPSData),function(err,res){
    console.log("The result is :"+res);                                        
  });    
};

s.initializeGPRS("cmnet", "59.108.126.38","8000", function(err, res) { // Works for China Mobile
        console.log('TCP is ok!');
        try{
            setInterval(psdata, 10000);
//            s.HTTPTERM();

        }catch(err){
          console.log("Connect to server error:"+err);
        }
});
        

serialPort.on('data', function(data) {

  var result = '';
  result = serialData.parSerialData(data.toString());
//   console.log('Parse results: ' + result);

  if (result!=null)
    gpsLoc = gpsRMCJson.getRMC(result);
  
  if(gpsLoc == null)
      return;

  if(gpsLoc.MessageID == '$GPRMC' && gpsLoc.Status == 'A'){
//    console.log('Parse results: ' + gpsLoc.Latitude);
    GPSData = {"DataType":"GPSLOC","GPSLOC":{"alt":gpsLoc.Latitude,"ult":gpsLoc.Longitude}};
  }

});
