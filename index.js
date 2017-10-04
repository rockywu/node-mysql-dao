"use strict";
/**
 * Created by rocky on 2017/10/4.
 */
const Client = require("./mysql/client");
const Dao = require("./mysql/dao");
const {testAsyncFunc} = require("./mysql/utils");

/**
 * 获取mysql链接
 * @param object configure
 *  {
        connectionLimit : 10,
        host            : '127.0.0.1',
        user            : 'root',
        password        : '',
        database        : 'icons'
 *  }
 * @param function logFunc 日志函数
 * @return Client
 */
function getClient(configure = null, logFunc = () => {}) {
    return new Client(configure, logFunc);
}

/**
 * 通过数据库链接获取dao对象
 * @param Client clientHandle 通过getClient创建数据库链接对象
 * @param String tableName 表名
 * @param String tablePk 表主键
 * @param Function logFunc 日志函数
 * @return Dao
 */
function getDaoByClient(clientHandle = null, tableName = "", tablePk = "", logFunc = () => {}) {
    return new Dao(clientHandle, tableName, tablePk, logFunc);
}

function getCallback(args) {
    args = [].slice.call(args);
    let cb = () => {};
    let ln = args.length;
    if(ln && isFunction(args[ln-1]) ) {
        cb = args[ln-1];
    }
    return cb;
}

module.exports = {
    getClient,
    getDaoByClient,
    testAsyncFunc
}
