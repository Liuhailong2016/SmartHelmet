/**
 * Created by haley on 16-9-29.
 */

var SerialPort = require("serialport");  
var sp;
var SIM900 = function(uart, baud) {
    this._uart = uart;
    this._baud = baud;
    this._clear();
 /*   
    try{
      this._sp = new SerialPort(this._uart, {
      baudrate: this._baud
      });
    }catch(er){
      console.log("Open serialport error:"+er);
    }
 */
  sp = new SerialPort(this._uart, { autoOpen: false, parser: SerialPort.parsers.readline('\n')},function (err) {
    if (err) {
    return console.log('Error: ', err.message);
    }

  });

//  sp.on('data', function(data) {
//      console.log('data received: ' + data);
//    });

};


SIM900.prototype._handleData = function(data) {
//    console.log('incoming data', data.toString());
    this._buffer = data;
};

SIM900.prototype._handleError = function(error) {
    this._error = error;
};

SIM900.prototype._clear = function() {
    this._buffer = null;
    this._error = null;
};

SIM900.prototype._writeCommand = function(buf, timeout, cb) {
    this._clear();
    var that = this;
    var originalBuf = buf;
    if(buf && buf.length > 0 && buf[buf.length-1] != String.fromCharCode(13))
        buf = buf+String.fromCharCode(13);
    console.log('writing', buf.toString());
    sp.write(buf, function(err) {
//        console.log('Serial port status:'+sp.isOpen());
        if(!sp.isOpen()) 
            sp.open(function(err){
                sp.drain(function() {
                    setTimeout(function() {
                        that._handleResponse(originalBuf, cb);
                    }, timeout);
                }); 
            });
        else 
            sp.drain(function() {
            setTimeout(function() {
                that._handleResponse(originalBuf, cb);
            }, timeout);
        }); 
    });
};

SIM900.prototype._writeCommandSequence = function(commands, timeout, cb) {
    var that = this;
    if(typeof timeout === 'function') {
        cb = timeout;
        timeout = null;
    }
    var processCommand = function(err, result) {
        if(err) return cb(err);
        if(commands.length === 0) return cb(err, result);
        var command = commands.shift();
        if(Array.isArray(command)) {
            timeout = command[1];
            command = command[0];
        }
        that._writeCommand(command, timeout, processCommand);
    };
    processCommand();
};

SIM900.prototype._handleResponse = function(buf, cb) {
    var response = null;
    var error = null;
    if(!this._buffer) return cb(error, response);
    var raw = this._buffer.toString().split("\r");
    console.log('raw', raw);
    raw.forEach(function(res) {
        res = res.trim();
        if(res === '') return;
        if(res != buf && res[0] == "+") return error = res.substr(1, res.length-1);
        if(res == "OK" || res == ">") {
            response = error || res;
            error = null;
        }
    });
    cb(error, response, raw);
};

SIM900.prototype.connect = function (cb) {
    //console.log('opening connection');
    var that = this;
    this._sp.open(function(err) {        
        that._sp.on('data', that._handleData.bind(that));    
        that._sp.on('error', that._handleError.bind(that));    
        cb(err);
    });
};

SIM900.prototype.close = function(cb) {
    this._sp.close();
};

SIM900.prototype.status = function(cb) {
    var that = this;
    this._writeCommand("AT+CREG?", 100, cb);
};

SIM900.prototype.sendSMS = function(number, message, cb) {
    var commands = [
        ["AT", 500],
        ["AT+CMGF=1", 500],
        ["AT+CMGS=\"+"+number+"\"", 500],
        [message+String.fromCharCode(parseInt("1A", 16)), 5000]
    ];
    
    this._writeCommandSequence(commands, function(err, res) {
        cb(err, res);
    });
};

SIM900.prototype.initializeGPRS = function(apn, svr, port,cb) {
    var commands = [
        "AT+CGCLASS=\"B\"",
        "AT+CGDCONT=1,\"IP\",\""+apn+"\"",
        "AT+CGATT=1",
        "AT+CIPCSGP=1,\"CMNET\"",
        "AT+CLPORT=\"TCP\",\"2000\"",
        "AT+CIPSTART=\"TCP\",\""+svr+"\",\""+port+"\"",
        "AT+SAPBR=3,1,\"APN\",\"CMNET\"",
        "AT+SAPBR=1,1",
        "AT+HTTPINIT",
        "AT+HTTPPARA=\"CID\",1",
        ["AT+HTTPPARA=\"URL\",\"http://"+svr+":"+port+"\"",1000]
    ];
    
    this._writeCommandSequence(commands, 3000, function(err, res) {
        cb(err, res);
    });
};

SIM900.prototype.HTTPGet = function(url, cb) {
    var that = this;
    var method = 0;
    
    var commands = [
        "AT+HTTPINIT",
        "AT+HTTPPARA=\"CID\",1",
        "AT+HTTPPARA=\"URL\",\""+url+"\"",
        ["AT+HTTPACTION="+method, 15000]
    ];
    
    this._writeCommandSequence(commands, 2500, function(err, res) {
/*
       if(err && err.indexOf("HTTPACTION:"+method+",200") > -1) {
            var bytes = err.replace("HTTPACTION:0,200,", "");
            that._readHTTPResponse(bytes, 0, cb);
        }
*/
        var bytes;
        that._readHTTPResponse(bytes, 0, cb);

        console.log("Reading data:"+bytes);

 //       that._writeCommand("AT+HTTPTERM", 100, function() {});
        return cb(err, res);
    });
};   

SIM900.prototype.HTTPPost = function(url, data, cb) {
    var that = this;
    var method = 1;
    
    var commands = [
//        ["AT+HTTPINIT",2500],
//        ["AT+HTTPPARA=\"CID\",1",2500],
//        ["AT+HTTPPARA=\"URL\",\""+url+"\"",2500],
        ["AT+HTTPDATA="+data.length+","+10000,1000],
        [data+String.fromCharCode(parseInt("1A", 16)), 1000],
        ["AT+HTTPACTION=1", 1000]
    ];

    this._writeCommandSequence(commands, 500, function(err, res) {
        if(err && err.indexOf("HTTPACTION:1,2") > -1) {
            var bytes = err.replace(/HTTPACTION:1,20[0-9],/, "");
            that._readHTTPResponse(bytes, 0, cb);
        };
//    that._writeCommand("AT+HTTPTERM", 100, function() {});

    return cb(err, res);
    });

//    setTimeout(function(){
/*
        this._writeCommandSequence(commands, 500, function(err, res) {
        if(err && err.indexOf("HTTPACTION:1,2") > -1) {
            var bytes = err.replace(/HTTPACTION:1,20[0-9],/, "");
            that._readHTTPResponse(bytes, 0, cb);
        };
        return cb(err, res);
    })
*/    
 //   console.log("It's OK.");    
 //   },5000);

};   

SIM900.prototype.HTTPTERM = function() {
    that._writeCommand("AT+HTTPTERM", 100, function() {});
};

SIM900.prototype._readHTTPResponse = function(bytes, start, cb) {
    var that = this;
    if(typeof start == 'function') {
        cb = start;
        start = 0;
    }
    
    var buff = '';
    var getBytes = function(start, end) {
        if(end > bytes) end = bytes;
        that._writeCommand("AT+HTTPREAD="+start+","+end, (end-start), function(err, res, raw) {
            if(raw && raw.length > 0 && raw[0] && (raw[raw.length-2] && raw[raw.length-2].trim() === "OK"))  {
                buff += raw[raw.length-3];
                if(end == bytes) {
                    that._writeCommand("AT+HTTPTERM", 100, function() {});
                    cb(null, buff);
                } else getBytes(end+1, end+101);
            } else {
                console.log('raw failed', raw);
//                that._writeCommand("AT+HTTPTERM", 100, function() {});
                return cb(err, buff);
            }
        });
    };
    getBytes(0, 100);
};


module.exports = SIM900;