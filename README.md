### node-mysql-dao


#### USE

```
function log() {
    console.log.apply(null, [].slice.call(arguments));
}

var cl = getClient({
    connectionLimit : 10,
    host            : '127.0.0.1',
    user            : 'root',
    password        : '',
    database        : 'icons'
},log);

/**
 * tableinfo 
  CREATE TABLE `permissions` (
    `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
    `gid` int(11) NOT NULL COMMENT '集合id',
    `uid` int(11) NOT NULL COMMENT '用户id',
    `aid` int(11) NOT NULL COMMENT '权限id',
    `create` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `gid` (`gid`,`uid`,`aid`)
  ) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8 COMMENT='用户权限关联关系';
 */
var permissions = getDaoByClient(cl, "permissions", "id", log);

testAsyncFunc("getall", permissions.find.bind(permissions), { "id > ?" : 0});

```


#### API

* getClient(configure, logFunc)

```
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
getClient(configure, logFunc)
```

* getDaoByClient(clientHandle, tableName, tablePk, logFunc)

```
/**
 * 通过数据库链接获取dao对象
 * @param Client clientHandle 通过getClient创建数据库链接对象
 * @param String tableName 表名
 * @param String tablePk 表主键
 * @param Function logFunc 日志函数
 * @return Dao
 */
getDaoByClient(clientHandle, tableName, tablePk, logFunc)
```

* testAsyncFunc(target, func)

```
/**
 * 异步测试函数,用于mysql操作测试
 * @param String target
 * @param Function func
 */
testAsyncFunc(target, func)
```

