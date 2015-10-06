/**
 * easylog .. simple file logger
 *
 * @author Ruchir Godura ruchir@cerient.com
 * Copyright (c) 2015 Cerient Technology LLC.
 */

/**
 * Module easylog. A simple log to file mechanism that handles
 * multiple log levels and file size rollover with autonaming.
 * @module easylog
 *
 * @example
 * var easylog = require('./easylog');
 * logfn1 = easylog.logger('logfile1.log');
 * logfn2 = easylog.logger(); // default is xo.log
 * 
 * //generate log messages
 * logfn1('ERROR', 'module1', 'this is %s message number %d', 'test', 1);
 * logfn2('INFO', 'module2', 'this is a JSON object %j', {key1: 'val1', key2: 'val2'});
 * 
 */

"use strict";
/* jshint browserify: true, browser: true, node: true */

var fs;
try {
  fs = require('fs');
} catch (e) {
  fs = null;
}

var path = require('path');
var util = require("util");

/**
 * ERROR LEVELS. 
 * Higher Levels include the lower levels.
 */
var levels = {
	ERROR: 0,
	WARN: 1,
	INFO: 2,
	DEBUG: 3,
	TRACE: 4,
	ALL: 5
};


var MAXFILESIZE = 2000000;
var LOGFOLDER = null;
var DEFAULTLOGFILE = 'xo.log';

var LogFuncs = {};
var TZOFFSET = (new Date()).getTimezoneOffset() * 60000; // timezone offset in milliseconds

/**
 * Returns a logging function function
 * @param   {String}  [logfile=DEFAULTLOGFILE] The name of te log file to write to.
 *                                           The log file is created in the folder LOGFOLDER
 * @returns {Function} logger function  function(level, name, message [, args...]) if successful. 
 *                     Null if some error occured in opening the log file 
 *                    for writing.
 */
var logger = function(logfile) {
  logfile = logfile || DEFAULTLOGFILE;
  if (logfile in LogFuncs)
    return LogFuncs[logfile];
  
  if (LOGFOLDER && fs){
    try {
      fs.appendFileSync(LOGFOLDER+logfile, '');
    } catch (e) {
      return null;
    }
  }
  
  var logfn = function(level, name, message) {
    if (!(level in levels))
      return false;
    if (levels[level] > logfn.loglevel) 
      return false;
    name = name || 'log';
    if(arguments.length > 2) 
      message = util.format.apply(null, Array.prototype.slice.call(arguments, 2));
    else
      message = message || level;
    var ts = (new Date(Date.now()-TZOFFSET)).toISOString().slice(0,-1);
    var msg = ts+' ['+level+'] ['+name+'] '+message+'\n';
    if (LOGFOLDER && fs){
      fs.appendFileSync(LOGFOLDER+logfn.logfile, msg);
      logfn.filesize += msg.length;
      if (logfn.filesize > logfn.maxFileSize){
        var newlogfile = ts.slice(0,16)+ '_' +
                         logfn.logfile;       
        fs.renameSync(LOGFOLDER+logfn.logfile, LOGFOLDER+newlogfile);
        fs.appendFileSync(LOGFOLDER+logfn.logfile, '');
        logfn.filesize = 0;
      }
    } else {
      console.log(msg);
    }
    return true;
  };
  
  logfn.logfile = logfile;
  if (LOGFOLDER && fs)
    logfn.filesize = fs.statSync(LOGFOLDER+logfile).size;
  else
    logfn.filesize = 0;
  logfn.maxFileSize = MAXFILESIZE;
  logfn.loglevel = levels.ERROR;
  logfn.setlevel = function(level) {
    if (!(level in levels))
      return false;
    logfn.loglevel = levels[level];
    return true;
  };
  LogFuncs[logfile] = logfn;
  return logfn;
};

/**
 * Set the log level for one or more log files.
 * @param   {String}  logfile Name of the log file. If null, all open log files are selected
 * @param   {String}  level   'ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE', 'ALL'
 * @returns {Boolean} true if set successfully. False if invalid level or logfile
 */
var setLogLevel = function(logfile, level) {
  if (!(level in levels))
    return false;
  if (!logfile) { // set all logs to same level
    for (var log in LogFuncs) {
      LogFuncs[log].loglevel = levels[level];
    }
    return true;
  }
  if (logfile in LogFuncs) {
    LogFuncs[logfile].loglevel = level;
    return true;
  }
  return false;
};

/**
 * Set the max file size for a log file
 * @param   {String}  logfile Name of log file. If null, all open log files are selected.
 * @param   {Number}  size    Max size of log file before it rolls over. Old file is saved
 *                          with current date and time prepended to the file name.
 * @returns {Boolean} True if size set successfully. False if invalid file or size;
 */
var setMaxFileSize = function(logfile, size) {
  if ((size > 10000000) || (size < 100))
    return false;
  
  if (!logfile) { // set all logs to same level
    for (var log in LogFuncs) {
      LogFuncs[log].maxFileSize = size;
    }
    return true;
  }
  if (logfile in LogFuncs) {
    LogFuncs[logfile].maxFileSize = size;
    return true;
  }
  return false;
};

/**
 * Set the folder under which log files will be created. Should be called once at the entry
 * point to the application.
 * @param {String} logFolder The full path of the folder
 */
var setLogFolder = function(logFolder) {
  if (logFolder) {
    LOGFOLDER = logFolder + '/';
  }
};

/**
 * Returns the current log folder.
 * @returns {String} The name of the current log folder
 */
var getLogFolder = function() {
  return LOGFOLDER;
};

exports.logger = logger;
exports.setLogLevel = setLogLevel;
exports.setMaxFileSize = setMaxFileSize;
exports.setLogFolder = setLogFolder;
exports.getLogFolder = getLogFolder;

if (require.main === module){  
    //eval(require('./easyrepl'));
}