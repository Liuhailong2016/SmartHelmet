
//设立串口读取ASCII字符串Buffer
var serialBuffer = new Buffer(300);
//初始化Buffer起始位置offset为0,
var offset = 0;

//设定最小的有效字符串长度
var validlength = 10;

//拼接后有效的GPS字符串
var gpstring;

module.exports = {
	
	//将字符串压入Buffer，拼接后返回有效的GPS数据包
     parSerialData:function(serialStr){

	//包头:head
	//包尾：rear
	var head = 30;
	var rear = 30;
	var str = serialStr.toString();
	
	serialBuffer.write(str,offset,str.toString().length,"ASCII");
	offset += str.length;

	for(var i=0;i<offset;i++)
	{
		//GPS数据以$表示包头，记录包头位置，以\n或者\r为包尾，记录包尾位置
		if(serialBuffer.toString('ASCII',i,i+3) == '$GP')
			head = i;
		else if(serialBuffer.toString('ASCII',i,i+1) == '\n' || serialBuffer.toString('ASCII',i,i+1) == '\r')
			{
				rear = i;
				if (rear-head >validlength)	//长度为有效的
				{
					//获取有效的GPS字符串
					gpstring = serialBuffer.toString('ASCII',head,rear);
					tmpBuffer = new Buffer(30);
					//将有效GPS字符串取出后，剩余的字符串移动到Buffer头
					serialBuffer.copy(tmpBuffer,0,rear+1,offset);
					serialBuffer.fill(0);
					tmpBuffer.copy(serialBuffer,0,0,offset-rear-1);
					//剩余字符串的结束位置为offset-rear-1，后续压入的字符串从offset-rear开始
					offset = offset-rear;
					//将有效GPS字符串返回
					return gpstring;					
				}

			}
	}
	return null;
}
}
