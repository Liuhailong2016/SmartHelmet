//串行执行流程控制
var async = require('async');

//数据库连接配置
var config = require('./config')['development'];
//var config = require('./config')['test'];

//数据库ORMaping
var Sequelize = require('sequelize');
var dbStroage = new Sequelize(config.database, config.username, config.password, config.option);

//移动设备模型数据数据操作
var DeviceRecord = dbStroage.import(__dirname + "/models/DeviceRecord");
//DeviceRecord.sync();

//标准GPS坐标（WGS84）转换为百度坐标（BD09）函数
var transData = require('./protocols/GPS/GPS2BDMap.js');
//标准GPS坐标（WGS84）转换结果
var tranGps;

//HTTP协议进行数据链路长连接
var http=require("http");
var server=http.createServer(function(req,res){
	    res.writeHead(200, {
        'Content-Type': 'text/plain'
	    });

        req.on("data",function (data) {
        //GPS坐标转换为百度BD09坐标
 		var gpsJson;

        console.log("服务器接受到的数据:"+data);

        try{
	 		 gpsJson=JSON.parse(data);
        }catch(e){
         	console.log("收到非Json数据:"+e);
         	return;
        }

        async.series([function(cb){
        		var altValue = parseFloat(gpsJson.GPSLOC.alt);
        		var ultValue = parseFloat(gpsJson.GPSLOC.ult);
        		tranGps = transData.gPS2BDLoc(altValue,ultValue);
		        console.log("tranGps.alt："+tranGps.bdalt);	
		        cb(null,'one');
        		},
        		function(cb){
				    DeviceRecord.build({
		    				TenantID : 'td987654321',
		    				DeviceSerialNO : 'ISN1234567890',
		    				DeviceTypeID : 'Hel',
		    				DeviceNo : 'SMHL1234567',
				    		BurnCode : 'RWID4567890',
		    				UserID : 'LW1234567',
		    				FactoryID : 'MMSH',
		    				OperateAreaID : 'MMSH60001',
		    				OperateSitID : 'MMSH600010001',
		    				LongitudeW84 : gpsJson.GPSLOC.ult,
		    				LatitudeW84 : gpsJson.GPSLOC.alt,
		    				LongitudeBD09 : tranGps.bdult,
		    				LatitudeBD09 : tranGps.bdalt,
		    				TimeStamp : Date.now()    
		    		}).save().then(function() {           
		        		console.log('Data successfully inserted');
		        		}).catch(function(error) {
		        				console.log('Error in Inserting Record'+error);
		        			});
		        	cb(null,'two');        			
        		}
        	],
        	function(err,results){
        		console.log('Sequence in trans or save Loc Data:'+results);
        	}
        	);	
		
	    });

  	    res.end('Hello Client.\n');   
});
server.listen(8000,function(){
    console.log("开始监听端口"+server.address().port+".....");
});

//判断是否为Json数据
function judgeJson(obj){
var isjson = typeof(obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length;    
return isjson;
}