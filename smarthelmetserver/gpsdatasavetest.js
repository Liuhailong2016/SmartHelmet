
var Sequelize = require('sequelize');
var config = require('./config')['development'];
var dbStroage = new Sequelize(config.database, config.username, config.password, config.option);
var DeviceRecord = dbStroage.import(__dirname + "/models/DeviceRecord");

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
		LongitudeW84 : 116.310653,
		LatitudeW84 : 40.041805,
		LongitudeBD09 : 116.32328898716193,
		LatitudeBD09 : 40.04896233264743,
		TimeStamp : Date.now()    
}).save().then(function() {           
	console.log('Data successfully inserted');
	}).catch(function(error) {
			console.log('Error in Inserting Record'+error);
		});