# easy-log
A lightweight logging library usable in node/CLI or in a browserjavascript app.

> Because sometimes it is easier to re-invent the wheel than to upgrade your axle :-)

Easy-Log is less than 200 lines and requires only `path` and `util`, making it ideal for usage in a library that may be used in a node-CLI or in a web application through `browserify` running in the browser.

You can instantiate a logging function that will thereafter output a formatted log statement with each invocation, including a timestamp.

The log level can be set at any point in time, causing all higher priority logs to be filtered out.
The `LOGFOLDER` can be set to an actual folder for use in `node` CLI applications or set to `null` (default) in which case the log statements will be output to console (for use in the browser).

The logger function outputs log statements to a log file and implements transparent log file turnover when the log file size exceeds MAXFILESIZE

# Usage
```
var easylog = require('easylog');
easylog.setLogFolder('/user/home/user1'); // set LOGFOLDER
easylog.setLogLevel('WARN');

var logger1 = easylog.logger('logfile1.log'); // logger1 will log to file logfile1.log in folder LOGFOLDER
var logger2 = easylog.logger(); // default is easy.log


logfn1('ERROR', 'module1', 'this is %s message number %d', 'test', 1); 
 // => 2015-10-06T07:28:18.965 [ERROR] [module1] this is test message number 1
logfn1('INFO', 'module1', 'this is %s message number %d', 'test', 1); 
 // => false
```

`easylog` defines the following log levels:
```
var levels = {
	ERROR: 0,
	WARN: 1,
	INFO: 2,
	DEBUG: 3,
	TRACE: 4,
	ALL: 5
};
```
