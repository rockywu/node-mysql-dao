"use strict";
/**
 * Created by rocky on 2017/7/24.
 */
const mysql = require("mysql");
const {isNull, isFunction} = require("lodash");
/**
 * 数据库链接
 * @param conf 数据库配置
 * @param logFunc 日志函数
 * @return {{query: query}}
 */
module.exports = function(conf, logFunc = () => {}) {
    logFunc = isFunction(logFunc) ? logFunc : () => {};
    let pool = null;
    if(conf && conf.host && conf.user && conf.database) {
        pool = mysql.createPool(conf);
    }
    if(isNull(pool)) {
        logFunc("数据库链接配置错误", conf);
        throw new Error("数据库链接配置错误");
    }

    /**
     * 数据库查询
     * @param sql
     * @param params
     * @param callback
     */
    function query(sql, params, callback) {
        pool.getConnection((err, connection) => {
            if(err) {
                logFunc(err);
                return callback(err);
            }
            connection.query(sql, params, (error, results, fields) => {
                connection.release();
                if(error) {
                    logFunc(error);
                    callback(error, fields);
                } else {
                    callback(null, results, fields);
                }
            });
        });
    }
    return {query};
}
