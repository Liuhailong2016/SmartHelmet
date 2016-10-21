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

//定位坐标JSON对象
var GPSData = {"DataType":"GPSLOC","GPSLOC":{"alt":40.041928,"ult":116.310430}};

//气体检测JSON对象
var GASData = new Array(3);
//ADS1115模拟量输入端AIN,AN0-'CO',AN1-'H2S',AN2-'CH4'
//gas：CO,H2S,CH4
//unit:ppm
GASData[0] = {"DataType":"GASVLU","GASVLU":{"gas":"CO","cncetrn":0.5},"GPSLOC":{"alt":40.041928,"ult":116.310430}};
GASData[1] = {"DataType":"GASVLU","GASVLU":{"gas":"H2S","cncetrn":0.5},"GPSLOC":{"alt":40.041928,"ult":116.310430}};
GASData[2] = {"DataType":"GASVLU","GASVLU":{"gas":"CH4","cncetrn":0.5},"GPSLOC":{"alt":40.041928,"ult":116.310430}};


//定义GPIO接口，读取ADS1115数模转换后的气体浓度数据
var ads1x15 = require('node-ads1x15');  
var chip = 1; //0 for ads1015, 1 for ads1115  



//Simple usage (default ADS address on pi 2b or 3):
var adc = new ads1x15(chip); 

// Optionally i2c address as (chip, address) or (chip, address, i2c_dev)
// So to use  /dev/i2c-0 use the line below instead...:
// var adc = new ads1x15(chip, 0x48, 'dev/i2c-0');

var channel = 0; //channel 0, 1, 2, or 3...  
var samplesPerSecond = '250'; // see index.js for allowed values for your chip  
var progGainAmp = '4096'; // see index.js for allowed values for your chip  


function psdata(){
    //发送GPS坐标数据
    s.HTTPPost('http://59.108.126.38:8000',JSON.stringify(GPSData),function(err,res){
    console.log("The result is :"+res);                                        
  });
    //获取气体检测数据
    getGasData(GASData.length,function(result){
    //发送气体检测数据
        s.HTTPPost('http://59.108.126.38:8000',JSON.stringify(result),function(err,res){
        console.log("The result is :"+res);                                        
      });        
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
    GPSData = {"DataType":"GPSLOC","GPSLOC":{"alt":parseFloat(gpsLoc.Latitude),"ult":parseFloat(gpsLoc.Longitude)}};
  }

});

function getGasData(gasNmb,cb(result)){
  //somewhere to store our reading   
  var reading  = 0;  
  if(!adc.busy)  
  {  
    for(var i=0;i<gasNmb;i++){
      channel = i;  
      adc.readADCSingleEnded(channel, progGainAmp, samplesPerSecond, function(err, data) {   
      if(err) 
      {  
        //logging / troubleshooting code goes here...  
        throw err;  
      }  
      // if you made it here, then the data object contains your reading!  
      reading = data; 
      // any other data processing code goes here...  
      GASData[i].GASVLU.cncetrn = parseFloat(reading);
      //气体检测数据，附加上最近一次有效的GPS定位数据
      GASData[i].GPSLOC.alt = GPSData.GPSLOC.Latitude;
      GASData[i].GPSLOC.ult = GPSData.GPSLOC.Longitude;

      }     
      );  
    }
    cb(GASData);  
   }
}
