"use strict";
/**
 * Created by rocky on 2017/10/4.
 */
const {isFunction} = require("lodash");

/**
 * 获取callback函数
 * @param args
 * @return {Function}
 */
function getCallback(args) {
    args = [].slice.call(args);
    let cb = () => {console.log.apply(null, [].slice.call(arguments))};
    let ln = args.length;
    if(ln && isFunction(args[ln-1]) ) {
        cb = args[ln-1];
    }
    return cb;
}

/**
 * 异步测试函数,用于mysql操作测试
 * @param String target
 * @param Function func
 */
function testAsyncFunc(target = "default", func = () => {}) {
    let params = [].slice.call(arguments, 2);
    console.log(99, params)
    let ln = params.length;
    if(!ln || !isFunction(params[ln - 1])) {
        params.push(function(err) {
            if(err) {
                return console.log(target + " -- Error:\n", err);
            }
            return console.log(target + " -- Success:\n", [].slice.call(arguments, 1));
        })
    }
    setTimeout(function() {
        func.apply(null, params);
    }, 500);
}

module.exports = {
    getCallback,
    testAsyncFunc
};
