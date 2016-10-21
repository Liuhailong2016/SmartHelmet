//var gpsStr = '$GPRMC, 161229.487, A, 3723.2475, N, 12158.3416, W, 0.13,309.62,,120598,, *10,\r\n';

var rmcArr = [
	'MessageID',
	'UTSPosition',
	'Status',
	'Latitude',
	'NSindicator',
	'Longitude',
	'EWIndicator',
	'SpeedOverGround',
	'CourseOver',
	'Ground',
	'Date',
	'Magneticvariation',
	'Checksum',
	'CRLF'];
var rmcJson = {};

/*GPS坐标转换：
	（1）2238.5260÷100=22.385260（round-off）=22 
	（2）385260÷60=6421
	 (3) 结果为：22.642100°
*/
function trsTitud(titude){
	var zsxs = String((titude/100.0).toFixed(6)).split(".");
	var zs = zsxs[0];			//整数部分
	var xsbf;					//小数部分

//	console.log(':'+titude);
	var xs6w = zsxs[1];
//	console.log('The GPS is:'+xs6w);
//	console.log('The Transed GPS is:'+parseInt(xs6w)/60.0);
	xsbf = String(((xs6w)/60.0/10000).toFixed(6)).split(".");

	var xs = xsbf[1];	//小数部分保持6位
	return zs+'.'+xs;
}

module.exports = {
    getRMC:function(gpsStr){
    	if(gpsStr!=null)
    	{

	        var arr = gpsStr.toString().split(",");
			for(var i=0;i<rmcArr.length;i++)
			{
				//第3、5字节分别是经度和维度，需做坐标转换
				if(i==3||i==5)
					rmcJson[rmcArr[i]] = trsTitud(arr[i]);
				else
				rmcJson[rmcArr[i]] = arr[i];
			};        
			return rmcJson;
    	}
    }
}
