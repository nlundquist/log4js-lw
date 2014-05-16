/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview log4js-lw is a library to log in JavaScript in similar manner
 * than in log4j for Java. The API should be nearly the same. This library
 * has been forked from log4js to have a reduced feature set and to remove
 * compatibility with older browsers. This oldest browser this library will be
 * compatible with is IE8+.
 *
 * This file contains all log4js code and is the only file required for logging.
 *
 * <h3>Example:</h3>
 * <pre>
 *  var log = new Log4js.getLogger("some-category-name"); //create logger instance
 *  log.setLevel(Log4js.Level.TRACE); //set the Level
 *  log.addAppender(new ConsoleAppender(log, false)); // logs to the js console

 *  // if multiple appenders are set all will log
 *  log.addAppender(new ConsoleAppender(log, true)); // console that is in-line in the page
 *  log.addAppender(new FileAppender("C:\\somefile.log")); // file appender logs to C:\\somefile.log
 *
 *  ...
 *
 *  //call the log
 *  log.trace("trace me" );
 * </pre>
 *
 * @version 1.0
 * @author Stephan Strittmatter - http://jroller.com/page/stritti
 * @author Seth Chisamore - http://www.chisamore.com
 * @author Nils Lundquist - nils.lundquist@gmail.com
 * @since 2005-05-20
 * @static
 * Website: http://github.com/stritti/log4js
 * Website: http://github.com/nlundquist/log4js-lw
 */


var Log4js = {

	/**
	 * Current version of log4js.
	 * @static
	 * @final
	 */
  	version: "1.0",

	/**  
	 * Date of logger initialized.
	 * @static
	 * @final
	 */
	applicationStartDate: new Date(),

	/**
	 * Hashtable of loggers.
	 * @static
	 * @final
	 * @private
	 */
	loggers: {},

	/**
	 * Get a logger instance. Instance is cached on categoryName level.
	 * @param  {String} categoryName name of category to log to.
	 * @return {Logger} instance of logger for the category
	 * @static
	 */
	getLogger: function(categoryName) {

		// Use default logger if categoryName is not specified or invalid
		if (!(typeof categoryName == "string")) {
			categoryName = "[default]";
		}

		if (!Log4js.loggers[categoryName]) {
			// Create the logger for this name if it doesn't already exist
			Log4js.loggers[categoryName] = new Log4js.Logger(categoryName);
		}

		return Log4js.loggers[categoryName];
	},

	/**
	 * Get the default logger instance.
	 * @return {Logger} instance of default logger
	 * @static
	 */
	getDefaultLogger: function() {
		return Log4js.getLogger("[default]");
	},

  	/**
  	 * Atatch an observer function to an elements event browser independent.
  	 *
  	 * @param element element to attach event
  	 * @param name name of event
  	 * @param observer observer method to be called
  	 * @private
  	 */
  	attachEvent: function (element, name, observer) {
		if (element.addEventListener) { //DOM event model
			element.addEventListener(name, observer, false);
    	} else if (element.attachEvent) { //M$ event model
			element.attachEvent('on' + name, observer);
    	}
	}
};

/**
 * @namespace
 * @constructor
 */
//Log4js = function(){};

/**
 * Internal object extension (OO) methods.
 *
 * @private
 */
Log4js.extend = function(destination, source) {
  for (property in source) {
    destination[property] = source[property];
  }
  return destination;
};

/**
 * Functions taken from Prototype library,
 * didn't want to require for just few functions.
 * More info at {@link http://prototype.conio.net/}
 * @private
 */
Log4js.bind = function(fn, object) {
  return function() {
        return fn.apply(object, arguments);
  };
};

/**
 * Log4js.Level Enumeration. Do not use directly. Use static objects instead.
 * @constructor
 * @param {Number} level number of level
 * @param {String} levelString String representation of level
 * @private
 */
Log4js.Level = function(level, levelStr) {
	this.level = level;
	this.levelStr = levelStr;
};

Log4js.Level.prototype =  {
	/**
	 * converts given String to corresponding Level
	 * @param {String} sArg String value of Level
	 * @param {Log4js.Level} defaultLevel default Level, if no String representation
	 * @return Level object
	 * @type Log4js.Level
	 */
	toLevel: function(sArg, defaultLevel) {

		if(sArg === null) {
			return defaultLevel;
		}

		if(typeof sArg == "string") {
			var s = sArg.toUpperCase();
			if(s == "ALL") {return Log4js.Level.ALL;}
			if(s == "DEBUG") {return Log4js.Level.DEBUG;}
			if(s == "INFO") {return Log4js.Level.INFO;}
			if(s == "WARN") {return Log4js.Level.WARN;}
			if(s == "ERROR") {return Log4js.Level.ERROR;}
			if(s == "FATAL") {return Log4js.Level.FATAL;}
			if(s == "OFF") {return Log4js.Level.OFF;}
			if(s == "TRACE") {return Log4js.Level.TRACE;}
			return defaultLevel;
		} else if(typeof sArg == "number") {
			switch(sArg) {
				case ALL_INT: return Log4js.Level.ALL;
				case DEBUG_INT: return Log4js.Level.DEBUG;
				case INFO_INT: return Log4js.Level.INFO;
				case WARN_INT: return Log4js.Level.WARN;
				case ERROR_INT: return Log4js.Level.ERROR;
				case FATAL_INT: return Log4js.Level.FATAL;
				case OFF_INT: return Log4js.Level.OFF;
				case TRACE_INT: return Log4js.Level.TRACE;
				default: return defaultLevel;
			}
		} else {
			return defaultLevel;
		}
	},
	/**
	 * @return  converted Level to String
	 * @type String
	 */
	toString: function() {
		return this.levelStr;
	},
	/**
	 * @return internal Number value of Level
	 * @type Number
	 */
	valueOf: function() {
		return this.level;
	}
};

// Static variables
/**
 * @private
 */
Log4js.Level.OFF_INT = Number.MAX_VALUE;
/**
 * @private
 */
Log4js.Level.FATAL_INT = 50000;
/**
 * @private
 */
Log4js.Level.ERROR_INT = 40000;
/**
 * @private
 */
Log4js.Level.WARN_INT = 30000;
/**
 * @private
 */
Log4js.Level.INFO_INT = 20000;
/**
 * @private
 */
Log4js.Level.DEBUG_INT = 10000;
/**
 * @private
 */
Log4js.Level.TRACE_INT = 5000;
/**
 * @private
 */
Log4js.Level.ALL_INT = Number.MIN_VALUE;

/**
 * Logging Level OFF - all disabled
 * @type Log4js.Level
 * @static
 */
Log4js.Level.OFF = new Log4js.Level(Log4js.Level.OFF_INT, "OFF");
/**
 * Logging Level Fatal
 * @type Log4js.Level
 * @static
 */
Log4js.Level.FATAL = new Log4js.Level(Log4js.Level.FATAL_INT, "FATAL");
/**
 * Logging Level Error
 * @type Log4js.Level
 * @static
 */
Log4js.Level.ERROR = new Log4js.Level(Log4js.Level.ERROR_INT, "ERROR");
/**
 * Logging Level Warn
 * @type Log4js.Level
 * @static
 */
Log4js.Level.WARN = new Log4js.Level(Log4js.Level.WARN_INT, "WARN");
/**
 * Logging Level Info
 * @type Log4js.Level
 * @static
 */
Log4js.Level.INFO = new Log4js.Level(Log4js.Level.INFO_INT, "INFO");
/**
 * Logging Level Debug
 * @type Log4js.Level
 * @static
 */
Log4js.Level.DEBUG = new Log4js.Level(Log4js.Level.DEBUG_INT, "DEBUG");
/**
 * Logging Level Trace
 * @type Log4js.Level
 * @static
 */
Log4js.Level.TRACE = new Log4js.Level(Log4js.Level.TRACE_INT, "TRACE");
/**
 * Logging Level All - All traces are enabled
 * @type Log4js.Level
 * @static
 */
Log4js.Level.ALL = new Log4js.Level(Log4js.Level.ALL_INT, "ALL");

/**
 * Log4js CustomEvent
 * @constructor
 * @author Corey Johnson - original code in Lumberjack (http://gleepglop.com/javascripts/logger/)
 * @author Seth Chisamore - adapted for Log4js
 * @private
 */
Log4js.CustomEvent = function() {
	this.listeners = [];
};

Log4js.CustomEvent.prototype = {

 	/**
 	 * @param method method to be added
 	 */
	addListener : function(method) {
		this.listeners.push(method);
	},

 	/**
 	 * @param method method to be removed
 	 */
	removeListener : function(method) {
		var foundIndexes = this.findListenerIndexes(method);

		for(var i = 0; i < foundIndexes.length; i++) {
			this.listeners.splice(foundIndexes[i], 1);
		}
	},

 	/**
 	 * @param handler
 	 */
	dispatch : function(handler) {
		for(var i = 0; i < this.listeners.length; i++) {
			try {
				this.listeners[i](handler);
			}
			catch (e) {
				log4jsLogger.warn("Could not run the listener " + this.listeners[i] + ". \n" + e);
			}
		}
	},

	/**
	 * @private
	 * @param method
	 */
	findListenerIndexes : function(method) {
		var indexes = [];
		for(var i = 0; i < this.listeners.length; i++) {
			if (this.listeners[i] == method) {
				indexes.push(i);
			}
		}

		return indexes;
	}
};

/**
 * Models a logging event.
 * @constructor
 * @param {String} categoryName name of category
 * @param {Log4js.Level} level level of message
 * @param {String} message message to log
 * @param {Log4js.Logger} logger the associated logger
 * @author Seth Chisamore
 */
Log4js.LoggingEvent = function(categoryName, level, message, exception, logger) {
	/**
	 * the timestamp of the Logging Event
	 * @type Date
	 * @private
	 */
	this.startTime = new Date();
	/**
	 * category of event
	 * @type String
	 * @private
	 */
	this.categoryName = categoryName;
	/**
	 * the logging message
	 * @type String
	 * @private
	 */
	this.message = message;
	/**
	 * the logging exception
	 * @type Exception
	 * @private
	 */
	this.exception = exception;
	/**
	 * level of log
	 * @type Log4js.Level
	 * @private
	 */
	this.level = level;
	/**
	 * reference to logger
	 * @type Log4js.Logger
	 * @private
	 */
	this.logger = logger;
};

Log4js.LoggingEvent.prototype = {
	/**
	 * get the timestamp formatted as String.
	 * @return {String} formatted timestamp
	 * @see Log4js#setDateFormat()
	 */
	getFormattedTimestamp: function() {
		if(this.logger) {
			return this.logger.getFormattedTimestamp(this.startTime);
		} else {
			return this.startTime.toGMTString();
		}
	}
};

/**
 * Logger to log messages to the defined appender.</p>
 * Default appender is Appender, which is ignoring all messages. Please
 * use setAppender() to set a specific appender (e.g. WindowAppender).
 * use {@see Log4js#getLogger(String)} to get an instance.
 * @constructor
 * @param name name of category to log to
 * @author Stephan Strittmatter
 */
Log4js.Logger = function(name) {
	this.loggingEvents = [];
	this.appenders = [];
	/** category of logger */
	this.category = name || "";
	/** level to be logged */
	this.level = Log4js.Level.FATAL;

	this.dateformat = Log4js.DateFormatter.DEFAULT_DATE_FORMAT;
	this.dateformatter = new Log4js.DateFormatter();

	this.onlog = new Log4js.CustomEvent();
	this.onclear = new Log4js.CustomEvent();

	/** appender to write in */
	this.appenders.push(new Log4js.Appender(this));

	// if multiple log objects are instantiated this will only log to the log
	// object that is declared last can't seem to get the attachEvent method to
	// work correctly
	try {
		window.onerror = this.windowError.bind(this);
	} catch (e) {
		//log4jsLogger.fatal(e);
	}
};

Log4js.Logger.prototype = {

	/**
	 * add additional appender. DefaultAppender always is there.
	 * @param appender additional wanted appender
	 */
	addAppender: function(appender) {
		if (appender instanceof Log4js.Appender) {
			appender.setLogger(this);
			this.appenders.push(appender);
		} else {
			throw "Not instance of an Appender: " + appender;
		}
	},

	/**
	 * set Array of appenders. Previous Appenders are cleared and removed.
	 * @param {Array} appenders Array of Appenders
	 */
	setAppenders: function(appenders) {
		//clear first all existing appenders
		for(var i = 0; i < this.appenders.length; i++) {
			this.appenders[i].doClear();
		}

		this.appenders = appenders;

		for(var j = 0; j < this.appenders.length; j++) {
			this.appenders[j].setLogger(this);
		}
	},

	/**
	 * Set the Loglevel default is LogLEvel.TRACE
	 * @param level wanted logging level
	 */
	setLevel: function(level) {
		this.level = level;
	},

	/**
	 * main log method logging to all available appenders
	 * @private
	 */
	log: function(logLevel, message, exception) {
		var loggingEvent = new Log4js.LoggingEvent(this.category, logLevel,
			message, exception, this);
		this.loggingEvents.push(loggingEvent);
		this.onlog.dispatch(loggingEvent);
	},

	/** clear logging */
	clear : function () {
		try{
			this.loggingEvents = [];
			this.onclear.dispatch();
		} catch(e){}
	},
	/** checks if Level Trace is enabled */
	isTraceEnabled: function() {
		if (this.level.valueOf() <= Log4js.Level.TRACE.valueOf()) {
			return true;
		}
		return false;
	},
	/**
	 * Trace messages
	 * @param message {Object} message to be logged
	 */
	trace: function(message) {
		if (this.isTraceEnabled()) {
			this.log(Log4js.Level.TRACE, message, null);
		}
	},
	/** checks if Level Debug is enabled */
	isDebugEnabled: function() {
		if (this.level.valueOf() <= Log4js.Level.DEBUG.valueOf()) {
			return true;
		}
		return false;
	},
	/**
	 * Debug messages
	 * @param message {Object} message to be logged
	 */
	debug: function(message) {
		if (this.isDebugEnabled()) {
			this.log(Log4js.Level.DEBUG, message, null);
		}
	},
	/**
	 * Debug messages
	 * @param {Object} message  message to be logged
	 * @param {Throwable} throwable
	 */
	debug: function(message, throwable) {
		if (this.isDebugEnabled()) {
			this.log(Log4js.Level.DEBUG, message, throwable);
		}
	},
	/** checks if Level Info is enabled */
	isInfoEnabled: function() {
		if (this.level.valueOf() <= Log4js.Level.INFO.valueOf()) {
			return true;
		}
		return false;
	},
	/**
	 * logging info messages
	 * @param {Object} message  message to be logged
	 */
	info: function(message) {
		if (this.isInfoEnabled()) {
			this.log(Log4js.Level.INFO, message, null);
		}
	},
	/**
	 * logging info messages
	 * @param {Object} message  message to be logged
	 * @param {Throwable} throwable
	 */
	info: function(message, throwable) {
		if (this.isInfoEnabled()) {
			this.log(Log4js.Level.INFO, message, throwable);
		}
	},
	/** checks if Level Warn is enabled */
	isWarnEnabled: function() {
		if (this.level.valueOf() <= Log4js.Level.WARN.valueOf()) {
			return true;
		}
		return false;
	},

	/** logging warn messages */
	warn: function(message) {
		if (this.isWarnEnabled()) {
			this.log(Log4js.Level.WARN, message, null);
		}
	},
	/** logging warn messages */
	warn: function(message, throwable) {
		if (this.isWarnEnabled()) {
			this.log(Log4js.Level.WARN, message, throwable);
		}
	},
	/** checks if Level Error is enabled */
	isErrorEnabled: function() {
		if (this.level.valueOf() <= Log4js.Level.ERROR.valueOf()) {
			return true;
		}
		return false;
	},
	/** logging error messages */
	error: function(message) {
		if (this.isErrorEnabled()) {
			this.log(Log4js.Level.ERROR, message, null);
		}
	},
	/** logging error messages */
	error: function(message, throwable) {
		if (this.isErrorEnabled()) {
			this.log(Log4js.Level.ERROR, message, throwable);
		}
	},
	/** checks if Level Fatal is enabled */
	isFatalEnabled: function() {
		if (this.level.valueOf() <= Log4js.Level.FATAL.valueOf()) {
			return true;
		}
		return false;
	},
	/** logging fatal messages */
	fatal: function(message) {
		if (this.isFatalEnabled()) {
			this.log(Log4js.Level.FATAL, message, null);
		}
	},
	/** logging fatal messages */
	fatal: function(message, throwable) {
		if (this.isFatalEnabled()) {
			this.log(Log4js.Level.FATAL, message, throwable);
		}
	},
	/**
	 * Capture main window errors and log as fatal.
	 * @private
	 */
	windowError: function(msg, url, line){
		var message = "Error in (" + (url || window.location) + ") on line "+ line +" with message (" + msg + ")";
		this.log(Log4js.Level.FATAL, message, null);
	},

	/**
	 * Set the date format of logger. Following switches are supported:
	 * <ul>
	 * <li>yyyy - The year</li>
	 * <li>MM - the month</li>
	 * <li>dd - the day of month<li>
	 * <li>hh - the hour<li>
	 * <li>mm - minutes</li>
	 * <li>O - timezone offset</li>
	 * </ul>
	 * @param {String} format format String for the date
	 * @see #getTimestamp
	 */
	setDateFormat: function(format) {
	 	this.dateformat = format;
	},

	/**
	 * Generates a timestamp using the format set in {Log4js.setDateFormat}.
	 * @param {Date} date the date to format
	 * @see #setDateFormat
	 * @return A formatted timestamp with the current date and time.
	 */
	getFormattedTimestamp: function(date) {
	  return this.dateformatter.formatDate(date, this.dateformat);
	}
};

/**
 * Abstract base class for other appenders.
 * It is doing nothing.
 *
 * @constructor
 * @param {Log4js.Logger} logger log4js instance this appender is attached to
 * @author Stephan Strittmatter
 */
Log4js.Appender = function () {
	/**
	 * Reference to calling logger
	 * @type Log4js.Logger
	 * @private
	 */
	 this.logger = null;
};

Log4js.Appender.prototype = {
	/**
	 * appends the given loggingEvent appender specific
	 * @param {Log4js.LoggingEvent} loggingEvent loggingEvent to append
	 */
	doAppend: function(loggingEvent) {
		return;
	},
	/**
	 * clears the Appender
	 */
	doClear: function() {
		return;
	},

	/**
	 * Set the Layout for this appender.
	 * @param {Log4js.Layout} layout Layout for formatting loggingEvent
	 */
	setLayout: function(layout){
		this.layout = layout;
	},
	/**
	 * Set reference to the logger.
	 * @param {Log4js.Logger} the invoking logger
	 */
	setLogger: function(logger){
		// add listener to the logger methods
		logger.onlog.addListener(Log4js.bind(this.doAppend, this));
		logger.onclear.addListener(Log4js.bind(this.doClear, this));

		this.logger = logger;
	}
};

/**
 * Interface for Layouts.
 * Use this Layout as "interface" for other Layouts. It is doing nothing.
 *
 * @constructor
 * @author Stephan Strittmatter
 */
Log4js.Layout = function(){};
Log4js.Layout.prototype = {
	/**
	 * Implement this method to create your own layout format.
	 * @param {Log4js.LoggingEvent} loggingEvent loggingEvent to format
	 * @return formatted String
	 * @type String
	 */
	format: function(loggingEvent) {
		return "";
	},
	/**
	 * Returns the content type output by this layout.
	 * @return The base class returns "text/plain".
	 * @type String
	 */
	getContentType: function() {
		return "text/plain";
	},
	/**
	 * @return Returns the header for the layout format. The base class returns null.
	 * @type String
	 */
	getHeader: function() {
		return null;
	},
	/**
	 * @return Returns the footer for the layout format. The base class returns null.
	 * @type String
	 */
	getFooter: function() {
		return null;
	},

	/**
	 * @return Separator between events
	 * @type String
	 */
	getSeparator: function() {
		return "";
	}
};



/**
 * AJAX Appender sending {@link Log4js.LoggingEvent}s asynchron via
 * <code>XMLHttpRequest</code> to server.<br />
 * The {@link Log4js.LoggingEvent} is POSTed as response content and is
 * formatted by the accociated layout. Default layout is {@link Log4js.XMLLayout}.
 * The <code>threshold</code> defines when the logs
 * should be send to the server. By default every event is sent on its
 * own (threshold=1). If it is set to 10, then the events are send in groups of
 * 10 events.
 *
 * @extends Log4js.Appender
 * @constructor
 * @param {Log4js.Logger} logger log4js instance this appender is attached to
 * @param {String} loggingUrl url where appender will post log messages to
 * @author Stephan Strittmatter
 */
Log4js.AjaxAppender = function(loggingUrl) {
	/**
	 * is still sending data to server
	 * @type boolean
	 * @private
	 */
	this.isInProgress = false;
    this.threshold = 1;

	/**
	 * timeout when request is aborted.
	 * @private
	 */
	this.timeout = 2000;

    this.loggingUrl = loggingUrl || "logging.log4js";
	this.loggingEventBuffer = new Log4js.FifoBuffer();
	this.layout = new Log4js.JSONLayout();
	this.httpRequest = null;
};

Log4js.AjaxAppender.prototype = Log4js.extend(new Log4js.Appender(), {
	/**
	 * sends the logs to the server
	 * @param loggingEvent event to be logged
	 * @see Log4js.Appender#doAppend
	 */
	doAppend: function(loggingEvent) {
		log4jsLogger.trace("> AjaxAppender.append");

		if (this.loggingEventBuffer.length() <= this.threshold || this.isInProgress === true) {
			this.loggingEventBuffer.push(loggingEvent);
		}

		if(this.loggingEventBuffer.length() >= this.threshold && this.isInProgress === false) {
			//if threshold is reached send the events and reset current threshold
			this.send();
		}

		log4jsLogger.trace("< AjaxAppender.append");
	},

	/** @see Appender#doClear */
	doClear: function() {
		log4jsLogger.trace("> AjaxAppender.doClear" );
		if(this.loggingEventBuffer.length() > 0) {
			this.send();
		}
		log4jsLogger.trace("< AjaxAppender.doClear" );
	},

	/**
	 * send the request.
	 */
	send: function() {
		if(this.loggingEventBuffer.length() >0) {
			log4jsLogger.trace("> AjaxAppender.send");

			this.isInProgress = true;
			var a = [];

			for(var i = 0; i < this.loggingEventBuffer.length() && i < this.threshold; i++) {
				a.push(this.layout.format(this.loggingEventBuffer.pull()));
			}

			var content = this.layout.getHeader();
			content += a.join(this.layout.getSeparator());
			content += this.layout.getFooter();

			var appender = this;

			if(this.httpRequest === null){
				this.httpRequest = new XMLHttpRequest();
                if (this.httpRequest.overrideMimeType && this.layout.getContentType) {
					this.httpRequest.overrideMimeType(this.layout.getContentType());
				}
			}
			this.httpRequest.onreadystatechange = function() {
				appender.onReadyStateChanged.call(appender);
			};

			this.httpRequest.open("POST", this.loggingUrl, true);

            if (this.layout.getContentType)
                this.httpRequest.setRequestHeader("Content-type", this.layout.getContentType());

            this.httpRequest.send(content);

			try {
				window.setTimeout(function(){
					log4jsLogger.trace("> AjaxAppender.timeout");
					appender.httpRequest.onreadystatechange = function(){return;};
					appender.httpRequest.abort();
					appender.isInProgress = false;

					if(appender.loggingEventBuffer.length() > 0) {
						appender.send();
					}
					log4jsLogger.trace("< AjaxAppender.timeout");
				}, this.timeout);
			} catch (e) {
				log4jsLogger.fatal(e);
			}

			log4jsLogger.trace("> AjaxAppender.send");
		}
	},

	/**
	 * @private
	 */
	onReadyStateChanged: function() {
		log4jsLogger.trace("> AjaxAppender.onReadyStateChanged");
		var req = this.httpRequest;

        if (this.httpRequest.readyState != 4) {
			log4jsLogger.trace("< AjaxAppender.onReadyStateChanged: readyState " + req.readyState + " != 4");
			return;
		}

		var success = ((typeof req.status === "undefined") || req.status === 0 ||
            (req.status >= 200 && req.status < 300));

		if (success) {
			log4jsLogger.trace("  AjaxAppender.onReadyStateChanged: success");

			//ready sending data
			this.isInProgress = false;
		} else {
			var msg = "  AjaxAppender.onReadyStateChanged: XMLHttpRequest request to URL " + this.loggingUrl + " returned status code " + this.httpRequest.status;
			log4jsLogger.error(msg);
		}

		log4jsLogger.trace("< AjaxAppender.onReadyStateChanged: readyState == 4");
	},

	/**
	 * toString
	 */
	 toString: function() {
	 	return "Log4js.AjaxAppender[loggingUrl=" + this.loggingUrl + ", threshold=" + this.threshold + "]";
	 }
});


/**
 * JS Console Appender writes the logs to the JavaScript console
 * @constructor
 * @extends Log4js.Appender
 * @param logger log4js instance this appender is attached to
 * @author Nils Lundquist
 */
Log4js.JSConsoleAppender = function() {
	this.layout = new Log4js.SimpleLayout();
};

Log4js.JSConsoleAppender.prototype = Log4js.extend(new Log4js.Appender(), {
	doAppend: function(loggingEvent) {
		console.log(
            this.layout.getHeader(),
            this.layout.format(loggingEvent),
            this.layout.getFooter()
        );
	},

	 toString: function() {
	 	return "Log4js.JSConsoleAppender";
	 }
});


/**
 * JS Alert Appender writes the logs to the JavaScript alert dialog box
 * @constructor
 * @extends Log4js.Appender
 * @param logger log4js instance this appender is attached to
 * @author S&eacute;bastien LECACHEUR
 */
Log4js.JSAlertAppender = function() {
	this.layout = new Log4js.SimpleLayout();
};

Log4js.JSAlertAppender.prototype = Log4js.extend(new Log4js.Appender(), {
	/**
	 * @see Log4js.Appender#doAppend
	 */
	doAppend: function(loggingEvent) {
		alert(this.layout.getHeader() + this.layout.format(loggingEvent) + this.layout.getFooter());
	},

	/**
	 * toString
	 */
	 toString: function() {
	 	return "Log4js.JSAlertAppender";
	 }
});


/**
 * SimpleLayout consists of the level of the log statement, followed by " - "
 * and then the log message itself. For example,
 * <code>DEBUG - Hello world</code>
 *
 * @constructor
 * @extends Log4js.Layout
 * @author Stephan Strittmatter
 */
Log4js.SimpleLayout = function() {
	this.LINE_SEP  = "\n";
	this.LINE_SEP_LEN = 1;
};

Log4js.SimpleLayout.prototype = Log4js.extend(new Log4js.Layout(), {
	/**
	 * Implement this method to create your own layout format.
	 * @param {Log4js.LoggingEvent} loggingEvent loggingEvent to format
	 * @return formatted String
	 * @type String
	 */
	format: function(loggingEvent) {
		return loggingEvent.level.toString() + " - " + loggingEvent.message + this.LINE_SEP;
	},
	/**
	 * Returns the content type output by this layout.
	 * @return The base class returns "text/plain".
	 * @type String
	 */
	getContentType: function() {
		return "text/plain";
	},
	/**
	 * @return Returns the header for the layout format. The base class returns null.
	 * @type String
	 */
	getHeader: function() {
		return "";
	},
	/**
	 * @return Returns the footer for the layout format. The base class returns null.
	 * @type String
	 */
	getFooter: function() {
		return "";
	}
});

/**
 * BasicLayout is a simple layout for storing the loggs. The loggs are stored
 * in following format:
 * <pre>
 * categoryName~startTime [logLevel] message\n
 * </pre>
 *
 * @constructor
 * @extends Log4js.Layout
 * @author Stephan Strittmatter
 */
Log4js.BasicLayout = function() {
	this.LINE_SEP  = "\n";
};

Log4js.BasicLayout.prototype = Log4js.extend(new Log4js.Layout(), {
	/**
	 * Implement this method to create your own layout format.
	 * @param {Log4js.LoggingEvent} loggingEvent loggingEvent to format
	 * @return formatted String
	 * @type String
	 */
	format: function(loggingEvent) {
		return loggingEvent.categoryName + "~" + loggingEvent.startTime.toLocaleString() + " [" + loggingEvent.level.toString() + "] " + loggingEvent.message + this.LINE_SEP;
	},
	/**
	 * Returns the content type output by this layout.
	 * @return The base class returns "text/plain".
	 * @type String
	 */
	getContentType: function() {
		return "text/plain";
	},
	/**
	 * @return Returns the header for the layout format. The base class returns null.
	 * @type String
	 */
	getHeader: function() {
		return "";
	},
	/**
	 * @return Returns the footer for the layout format. The base class returns null.
	 * @type String
	 */
	getFooter: function() {
		return "";
	}
});



/**
 * JSONLayout write the logs in JSON format.
 * JSON library is required to use this Layout. See also {@link http://www.json.org}
 * @constructor
 * @extends Log4js.Layout
 * @author Stephan Strittmatter
 */
Log4js.JSONLayout = function() {
	this.df = new Log4js.DateFormatter();
};
Log4js.JSONLayout.prototype = Log4js.extend(new Log4js.Layout(), {
	/**
	 * Implement this method to create your own layout format.
	 * @param {Log4js.LoggingEvent} loggingEvent loggingEvent to format
	 * @return formatted String
	 * @type String
	 */
	format: function(loggingEvent) {

				var useragent = "unknown";
		try {
			useragent = navigator.userAgent;
		} catch(e){
			useragent = "unknown";
		}

		var referer = "unknown";
		try {
			referer = location.href;
		} catch(e){
			referer = "unknown";
		}

		var jsonString = "{\n \"LoggingEvent\": {\n";

		jsonString += "\t\"logger\": \"" +  loggingEvent.categoryName + "\",\n";
		jsonString += "\t\"level\": \"" +  loggingEvent.level.toString() + "\",\n";
		jsonString += "\t\"message\": \"" +  loggingEvent.message + "\",\n";
		jsonString += "\t\"referer\": \"" + referer + "\",\n";
		jsonString += "\t\"useragent\": \"" + useragent + "\",\n";
		jsonString += "\t\"timestamp\": \"" +  this.df.formatDate(loggingEvent.startTime, "yyyy-MM-ddThh:mm:ssZ") + "\",\n";
		jsonString += "\t\"exception\": \"" +  loggingEvent.exception + "\"\n";
		jsonString += "}}";

        return jsonString;
	},
	/**
	 * Returns the content type output by this layout.
	 * @return The base class returns "text/xml".
	 * @type String
	 */
	getContentType: function() {
		return "text/json";
	},
	/**
	 * @return Returns the header for the layout format. The base class returns null.
	 * @type String
	 */
	getHeader: function() {
		return "{\"Log4js\": [\n";
	},
	/**
	 * @return Returns the footer for the layout format. The base class returns null.
	 * @type String
	 */
	getFooter: function() {
		return "\n]}";
	},

	getSeparator: function() {
		return ",\n";
	}
});


/**
 * @private
 * @ignore
 */
if (!Array.prototype.push) {
	/**
	 * Functions taken from Prototype library, didn't want to require for just few
	 * functions.
	 * More info at {@link http://prototype.conio.net/}
	 * @private
	 */
	Array.prototype.push = function() {
		var startLength = this.length;
		for (var i = 0; i < arguments.length; i++) {
			this[startLength + i] = arguments[i];
		}
		return this.length;
	};
}


/**
 * FIFO buffer
 * @constructor
 * @private
 */
Log4js.FifoBuffer = function()
{
  this.array = new Array();
};

Log4js.FifoBuffer.prototype = {

	/**
	 * @param {Object} obj any object added to buffer
	 */
	push : function(obj) {
        this.array[this.array.length] = obj;
        return this.array.length;
	},

	/**
	 * @return first putted in Object
	 */
	pull : function() {
		if (this.array.length > 0) {
			var firstItem = this.array[0];
			for (var i = 0; i < this.array.length - 1; i++) {
				this.array[i] = this.array[i + 1];
			}
			this.array.length = this.array.length - 1;
			return firstItem;
		}
		return null;
	},

	length : function() {
		return this.array.length;
	}
};



/**
 * Date Formatter
 * addZero() and formatDate() are courtesy of Mike Golding:
 * http://www.mikezilla.com/exp0015.html
 * @constructor
 */
Log4js.DateFormatter = function() {
	return;
};
/**
 * default format of date (ISO-8601)
 * @static
 * @final
 */
Log4js.DateFormatter.DEFAULT_DATE_FORMAT = "yyyy-MM-ddThh:mm:ssO";


Log4js.DateFormatter.prototype = {
	/**
	 * Formats the given date by the given pattern.<br />
	 * Following switches are supported:
	 * <ul>
	 * <li>yyyy: The year</li>
	 * <li>MM: the month</li>
	 * <li>dd: the day of month<li>
	 * <li>hh: the hour<li>
	 * <li>mm: minutes</li>
	 * <li>O: timezone offset</li>
	 * </ul>
	 * @param {Date} vDate the date to format
	 * @param {String} vFormat the format pattern
	 * @return {String} formatted date string
	 * @static
	 */
	formatDate : function(vDate, vFormat) {
	  var vDay = this.addZero(vDate.getDate());
	  var vMonth = this.addZero(vDate.getMonth()+1);
	  var vYearLong = this.addZero(vDate.getFullYear());
	  var vYearShort = this.addZero(vDate.getFullYear().toString().substring(3,4));
	  var vYear = (vFormat.indexOf("yyyy")>-1?vYearLong:vYearShort);
	  var vHour  = this.addZero(vDate.getHours());
	  var vMinute = this.addZero(vDate.getMinutes());
	  var vSecond = this.addZero(vDate.getSeconds());
	  var vTimeZone = this.O(vDate);
	  var vDateString = vFormat.replace(/dd/g, vDay).replace(/MM/g, vMonth).replace(/y{1,4}/g, vYear);
	  vDateString = vDateString.replace(/hh/g, vHour).replace(/mm/g, vMinute).replace(/ss/g, vSecond);
	  vDateString = vDateString.replace(/O/g, vTimeZone);
	  return vDateString;
	},

	/**
	 * @private
	 * @static
	 */
	addZero : function(vNumber) {
	  return ((vNumber < 10) ? "0" : "") + vNumber;
	},

	/**
	 * Formates the TimeOffest
	 * Thanks to http://www.svendtofte.com/code/date_format/
	 * @private
	 */
	O : function (date) {
		// Difference to Greenwich time (GMT) in hours
		var os = Math.abs(date.getTimezoneOffset());
		var h = String(Math.floor(os/60));
		var m = String(os%60);
		h.length == 1? h = "0"+h:1;
		m.length == 1? m = "0"+m:1;
		return date.getTimezoneOffset() < 0 ? "+"+h+m : "-"+h+m;
	}
};


/**
 * internal Logger to be used
 * @private
 */
var log4jsLogger = Log4js.getLogger("Log4js");
log4jsLogger.addAppender(new Log4js.JSConsoleAppender());
log4jsLogger.setLevel(Log4js.Level.OFF);