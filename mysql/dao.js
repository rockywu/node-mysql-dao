"use strict";
/**
 * 数据库操作
 * Created by rocky on 16/7/9.
 */
const {forEach, isFunction, isString, isArray, isNull, keys} = require("lodash");
const {getCallback} = require("./utils");

/**
 * 数据库操作类
 */
function dao(client, tableName, primaryKey, logFunc = () => {}) {
    if(!tableName || !primaryKey || !client) {
        throw new Error("Dao 必须设置表名、主键、数据库链接");
    }
    this.tb = tableName|| null;
    this.pk = primaryKey || null;
    this.client = client;
    this.logFunc = isFunction(logFunc) ? logFunc : () => {};
    this.fields = {};
    this.initialize();
}

/**
 * dao初始化表结构
 */
dao.prototype.initialize = function() {
    let _this = this;
    this.client.query("SELECT * FROM " + this.tb + " limit 0", [], function(err, rows, fields) {
        forEach(fields, function(filed) {
            if(filed.name) {
                _this.fields[filed.name] = true;
            }
        });
        _this.logFunc( "table " + _this.tb + ", fields : " , keys(_this.fields));
    })
}

/**
 * buildWhere
 */
dao.prototype.buildWhere = function(where) {
    let _this = this;
    let sql = "";
    let values = [];
    let params = [];
    if(typeof where == 'string' && where != "") {
        values.push(where);
    } else if(typeof where == "object") {
        forEach(where, function(val, key) {
            if(key.indexOf('?') >= 0) {
                //带问好传递
                values.push(key);
                params.push(val);
            } else {
                if(!_this.fields[key]) {
                    //该字段不存在
                    return;
                }
                if(isArray(val)) {
                    let p = [];
                    forEach(val, function(v){
                        p.push("?");
                        params.push(v);
                    });
                    values.push( "`" + key + "`" + " IN (" + p.join(",")+ ")");
                    p = null;
                } else {
                    values.push( "`" + key + "`" + "=?");
                    params.push(val);
                }
            }
        });
        if(values.length > 0) {
            sql += " " + values.join(" AND ");
        }
        return {
            sql : sql == "" ? "" : " WHERE " + sql,
            params : params
        }
    } else {
        throw new Error("Dao buildWhere is error");
    }

}

/**
 * buildFields
 */
dao.prototype.buildFields = function(fields) {
    let _this = this;
    let fieldStr = "";
    if(isArray(fields)) {
        let tmp = [];
        forEach(fields, function(field) {
            if(_this.fields[field]) {
                tmp.push("`" + field + "`");
            }
        });
        fieldStr = tmp.join(",");
        tmp = null;
    } else if(isString(fields)) {
        fieldStr = fields || "*";
    } else {
        fieldStr = "*";
    }
    return fieldStr;
}

/**
 * fontRow查询单条记录
 */
dao.prototype.findRow = function(where, order, fields) {
    let cb = getCallback(arguments);
    this.find(where, order, 1, null, fields, (err, rs) => {
        cb(err || null, rs.length > 0 ? rs[0] : null);
    })
}

/**
 * fontCnt 查询where条件数据数量
 */
dao.prototype.findCnt = function(where) {
    let cb = getCallback(arguments);
    this.findRow(where, null, "count(1) as cnt", (err, rs) => {
        cb(err || null, parseInt(rs.cnt, 10) || 0);
    });
}

/**
 * find 查询
 * @type {dao}
 */
dao.prototype.find = function(where, order, limit, offset, fields) {
    order = isString(order) ? order : "";
    limit = limit > 0 ? parseInt(limit, 10) : '';
    offset = parseInt(offset, 10) || "";
    let buildWhere = this.buildWhere(where);
    let sql = "SELECT";
    sql += " " + this.buildFields(fields);
    sql += " FROM " + this.tb;
    sql += " " + buildWhere.sql;
    if(order != "") {
        sql += " ORDER BY " + order;
    }
    if(limit != "") {
        sql += " LIMIT " + limit;
        if(offset != "") {
            sql += " OFFSET " + offset;
        }
    }
    let cb = getCallback(arguments);
    this.execute(sql, buildWhere.params, (err, rs) => {
        cb(err || null, rs);
    });
}

/**
 * insert 插入/批量插入导入
 * @param {object | array} data 当data为array则批量导入，为obj时则逐条导入
 * @type {dao}
 */
dao.prototype.insert = function(data) {
    let _this = this;
    let keys = [];
    let hasKeys = false;
    let values = [];
    let tmpValues;
    let params = [];
    if(!isArray(data)) {
        data = [data];
    }
    forEach(data, function(row) {
        tmpValues = [];
        forEach(row, function(val, key) {
            if (_this.pk == key || !_this.fields[key]) {return; }; //如果插入的key等于主键或者字段不存在，直接return
            if(!hasKeys) {//获取插入字段
                keys.push("`" + key + "`");
            }
            tmpValues.push("?");
            params.push(val);
        });
        values.push("(" + tmpValues.join(",")+ ")")
        hasKeys = true;
    });
    let sql = "INSERT INTO " + this.tb + " (";
    sql += " " + keys.join(",");
    sql += " ) VALUES " + values.join(",");
    values = null;
    keys = null;
    tmpValues = null;
    let cb = getCallback(arguments);
    this.execute(sql, params, (err, rs) => {
        cb(err || null, rs);
    });
}

/**
 * update 更新
 * @type {dao}
 */
dao.prototype.update = function(data, where) {
    let _this = this;
    let sets = [];
    let params = [];
    let sql = "UPDATE";
    sql += " " + this.tb;
    forEach(data, function(val, key) {
        if(_this.pk == key || !_this.fields[key]) { return; }
        sets.push("`" + key + "`" + "= ?");
        params.push(val);
    })
    sql += " SET " + sets.join(",");
    let buildWhere = this.buildWhere(where);
    sql += " " + buildWhere.sql;
    forEach(buildWhere.params, function (val) {
        params.push(val);
    });
    let cb = getCallback(arguments);
    this.execute(sql, params, (err, rs) => {
        cb(err || null, rs);
    });
}

/**
 * delete
 * @param where
 * @return {void|SQLResultSet}
 */
dao.prototype.delete = function(where) {
    let sql = "DELETE FROM";
    sql += " " + this.tb;
    let buildWhere = this.buildWhere(where);
    sql += buildWhere.sql;
    let cb = getCallback(arguments);
    this.execute(sql, buildWhere.params, (err, rs) => {
        cb(err || null, rs);
    });
}

/**
 * 去除首尾空格
 * @param str
 * @return {XML|string|void|*}
 */
function trim(str) {
    return str.replace(/(^\s*)|(\s*$)/g, '');
}
/**
 * 获取sql类型
 * @param sql
 * @return {string}
 */
function getSqlType(sql) {
    sql = trim(sql);
    //获取语句类型
    return sql.substr(0, sql.indexOf(" ")).toUpperCase();
}
/**
 * 格式化sql数据
 */
function formatSqlData(type, data) {
    let result = null;
    switch(type) {
        case 'INSERT':
            result = !isNull(data) ? data.insertId : 0;
            break;
        case 'SELECT':
            result = data || [];
            break;
        case 'UPDATE':
        case 'DELETE':
            result = !isNull(data) ? (parseInt(data.affectedRows, 10) || 0) : 0;
            break;
        default:
            break;
    }
    return result;
}

/**
 * execute
 * @type {dao}
 */
dao.prototype.execute = function(sql, params) {
    this.logFunc("query : \"" + sql + "\"", params);
    let cb = getCallback(arguments);
    let type = getSqlType(sql);
    this.client.query(sql, params, (err, rows, fields) => {
        if(err) return cb(err);
        let rs = formatSqlData(type, rows);
        cb(null, rs, fields);
    });
}

module.exports = dao;
