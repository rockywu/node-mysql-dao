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

var permissions = getDaoByClient(cl, "permissions", "id", log);

testAsyncFunc("getall", permissions.find.bind(permissions), { "id > ?" : 0});

```


#### API

* getClient

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
```

* getDaoByClient

```
/**
 * 通过数据库链接获取dao对象
 * @param Client clientHandle 通过getClient创建数据库链接对象
 * @param String tableName 表名
 * @param String tablePk 表主键
 * @param Function logFunc 日志函数
 * @return Dao
 */
```

* testAsyncFunc

```
/**
 * 异步测试函数,用于mysql操作测试
 * @param String target
 * @param Function func
 */
```

