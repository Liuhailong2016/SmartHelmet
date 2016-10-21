/**
 * Created by haley on 16-9-6.
 */
var config = require('../config')['development'];
var Sequelize = require('sequelize');
var dbStroage = new Sequelize(config.database, config.username, config.password, config.option);

// definition
module.exports = function(dbStroage, DataTypes){

    return dbStroage.define('MA_DevicePost_SceneGPs',{
    // auto increment, primaryKey, unique
    id : {type : DataTypes.INTEGER, primaryKey : true, autoIncrement:true, unique : true},

    // 租户
    TenantID : {type : DataTypes.STRING, allowNull : false},

    // 设备序列号
    DeviceSerialNO : {type : DataTypes.STRING, allowNull : false},

    // 设备类型
    DeviceTypeID : {type : DataTypes.STRING, allowNull : false},

    //设备编号
    DeviceNo : {type : DataTypes.STRING, allowNull : false},

    //烧录编码，可作为入网许可证来使用
    BurnCode : {type : DataTypes.STRING, allowNull : false},

    //用户ID
    UserID : {type : DataTypes.STRING, allowNull : false},

    //工厂ID
    FactoryID : {type : DataTypes.STRING, allowNull : true},

    //操作区域ID
    OperateAreaID : {type : DataTypes.STRING, allowNull : true},

    //操作地点ID
    OperateSitID : {type : DataTypes.STRING, allowNull : true},

    //经度(WGS84)
    LongitudeW84 : {type : DataTypes.STRING, allowNull : false},

    //维度(WGS84)
    LatitudeW84 : {type : DataTypes.STRING, allowNull : false},

    //经度(BD09)
    LongitudeBD09 : {type : DataTypes.STRING, allowNull : true},

    //维度(BD09)
    LatitudeBD09 : {type : DataTypes.STRING, allowNull : true},

    //朝向
    Heading : {type : DataTypes.DOUBLE, allowNull : true},

    //水平速度
    GroundSpeed : {type : DataTypes.DOUBLE, allowNull : true},

    //海拔
    altitude : {type : DataTypes.DOUBLE, allowNull : true},

    //时间戳
    TimeStamp : {type : DataTypes.DATE, allowNull : true, defaultValue : DataTypes.NOW},

    //位置数据号
    PositionDataNo : {type : DataTypes.STRING, allowNull : true},

    //备注
    Remarks : {type : DataTypes.TEXT, allowNull : true}
});
};