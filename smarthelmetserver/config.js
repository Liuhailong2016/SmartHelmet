var config = {
  "test": {
      "username": 'wanghao',
      "password": 'wanghao_123',
      "database": 'ls_2016',
      "option" : {
      	  "host":'mysql.rdsmci2a3mdjgiw.rds.bj.baidubce.com',
      	  "port":'3306',
          "dialect": 'mysql'
      }
    },
  "development": {
      "username": 'root',
      "password": 'root',
      "database": 'SCP',
      "option" : {
          "host":'59.108.126.38',
          "port":'8066',
          "dialect": 'mysql'
      }

  }
};
module.exports = config;