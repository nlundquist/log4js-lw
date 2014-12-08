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
 * than in log4j for Java. This library has been forked from log4js to have a
 * reduced feature set and to remove compatibility with older browsers.
 * This oldest browser this library will be compatible with is IE8+.
 *
 * This file contains all log4js code and is the only file required for logging.
 *
 * <h3>Example:</h3>
 * <pre>
 *  var log = new log4js.getLogger("some-category-name"); //create logger instance
 *  log.setLevel(log4js.Level.TRACE); //set the Level
 *  log.addAppender(new JSConsoleAppender(log, false)); // logs to the js console

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


window['log4js'] = {
  	version: "1.0-lw",
	applicationStartDate: new Date(),
	loggers: {},

	getLogger: function(name) {
        if (!log4js.loggers[name])
			log4js.loggers[name] = new log4js.Logger(name);

		return log4js.loggers[name];
	}
};



/* utils */
log4js.extend = function(destination, source) {
  for (property in source) {
    destination[property] = source[property];
  }
  return destination;
};

log4js.bind = function(fn, object) {
  return function() {
        return fn.apply(object, arguments);
  };
};

log4js.FifoBuffer = function() {
  this.array = new Array();
};

log4js.FifoBuffer.prototype = {
    push : function(obj) {
        this.array[this.array.length] = obj;
        return this.array.length;
	},
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
 * CustomEvent
 * @constructor
 * @author Corey Johnson - original code in Lumberjack (http://gleepglop.com/javascripts/logger/)
 * @author Seth Chisamore - adapted for log4js
 * @private
 */
log4js.CustomEvent = function() {
	this.listeners = [];
};

log4js.CustomEvent.prototype = {
	addListener : function(method) {
		this.listeners.push(method);
	},
	removeListener : function(method) {
		var foundIndexes = this.findListenerIndexes(method);

		for(var i = 0; i < foundIndexes.length; i++) {
			this.listeners.splice(foundIndexes[i], 1);
		}
	},
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
 * log4js.Level Enumeration. Do not use directly. Use static objects instead.
 * @constructor
 * @param {Number} level number of level
 * @param {String} levelString String representation of level
 * @private
 */
log4js.Level = function(level, levelStr) {
	this.level = level;
	this.levelStr = levelStr;
};

log4js.Level.prototype =  {
	/**
	 * converts given String to corresponding Level
	 * @param {String} sArg String value of Level
	 * @param {log4js.Level} defaultLevel default Level, if no String representation
	 * @return Level object
	 * @type log4js.Level
	 */
	toLevel: function(sArg, defaultLevel) {

		if(sArg === null) {
			return defaultLevel;
		}

		if(typeof sArg == "string") {
			var s = sArg.toUpperCase();
			if(s == "ALL") {return log4js.Level.ALL;}
			if(s == "DEBUG") {return log4js.Level.DEBUG;}
			if(s == "INFO") {return log4js.Level.INFO;}
			if(s == "WARN") {return log4js.Level.WARN;}
			if(s == "ERROR") {return log4js.Level.ERROR;}
			if(s == "FATAL") {return log4js.Level.FATAL;}
			if(s == "OFF") {return log4js.Level.OFF;}
			if(s == "TRACE") {return log4js.Level.TRACE;}
			return defaultLevel;
		} else if(typeof sArg == "number") {
			switch(sArg) {
				case ALL_INT: return log4js.Level.ALL;
				case DEBUG_INT: return log4js.Level.DEBUG;
				case INFO_INT: return log4js.Level.INFO;
				case WARN_INT: return log4js.Level.WARN;
				case ERROR_INT: return log4js.Level.ERROR;
				case FATAL_INT: return log4js.Level.FATAL;
				case OFF_INT: return log4js.Level.OFF;
				case TRACE_INT: return log4js.Level.TRACE;
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
log4js.Level.OFF_INT = Number.MAX_VALUE;
log4js.Level.FATAL_INT = 50000;
log4js.Level.ERROR_INT = 40000;
log4js.Level.WARN_INT = 30000;
log4js.Level.INFO_INT = 20000;
log4js.Level.DEBUG_INT = 10000;
log4js.Level.TRACE_INT = 5000;
log4js.Level.ALL_INT = Number.MIN_VALUE;
log4js.Level.OFF = new log4js.Level(log4js.Level.OFF_INT, "OFF");
log4js.Level.FATAL = new log4js.Level(log4js.Level.FATAL_INT, "FATAL");
log4js.Level.ERROR = new log4js.Level(log4js.Level.ERROR_INT, "ERROR");
log4js.Level.WARN = new log4js.Level(log4js.Level.WARN_INT, "WARN");
log4js.Level.INFO = new log4js.Level(log4js.Level.INFO_INT, "INFO");
log4js.Level.DEBUG = new log4js.Level(log4js.Level.DEBUG_INT, "DEBUG");
log4js.Level.TRACE = new log4js.Level(log4js.Level.TRACE_INT, "TRACE");
log4js.Level.ALL = new log4js.Level(log4js.Level.ALL_INT, "ALL");



/**
 * Models a logging event.
 * @constructor
 * @param {String} categoryName name of category
 * @param {log4js.Level} level level of message
 * @param {String} message message to log
 * @param {log4js.Logger} logger the associated logger
 * @author Seth Chisamore
 */
log4js.LoggingEvent = function(categoryName, level, message, exception, logger) {
	this.startTime = new Date();
	this.categoryName = categoryName;
	this.message = message;
	this.exception = exception;
	this.level = level;
	this.logger = logger;

    // Additional optional fields to be handled by formatter as seen fit
    // Some of these fields may be intended for use by a particular appender only
    // Typically these fields are set dynamically by a Logger.onlog handler
    this.extra = {};
};

log4js.LoggingEvent.prototype = {
	/**
	 * get the timestamp formatted as String.
	 * @return {String} formatted timestamp
	 * @see log4js#setDateFormat()
	 */
	getFormattedTimestamp: function() {
		if(this.logger) {
			return this.logger.getFormattedTimestamp(this.startTime);
		} else {
			return this.startTime.toString();
		}
	}
};




/**
 * Logger to log messages to the defined appender.</p>
 * Default appender is Appender, which is ignoring all messages. Please
 * use setAppender() to set a specific appender (e.g. WindowAppender).
 * use {@see log4js#getLogger(String)} to get an instance.
 * @constructor
 * @param name name of category to log to
 * @author Stephan Strittmatter
 */
log4js.Logger = function(name) {
	this.loggingEvents = [];
	this.appenders = [];
	/** category of logger */
	this.category = name || "";
	/** level to be logged */
	this.level = log4js.Level.FATAL;

	this.onlog = new log4js.CustomEvent();
	this.onclear = new log4js.CustomEvent();

	/** appender to write in */
	this.appenders.push(new log4js.Appender(this));
};

log4js.Logger.prototype = {

	/**
	 * add additional appender. DefaultAppender always is there.
	 * @param appender additional wanted appender
	 */
	addAppender: function(appender) {
		if (appender instanceof log4js.Appender) {
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
		var loggingEvent = new log4js.LoggingEvent(this.category, logLevel,
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
		if (this.level.valueOf() <= log4js.Level.TRACE.valueOf()) {
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
			this.log(log4js.Level.TRACE, message, null);
		}
	},
	/** checks if Level Debug is enabled */
	isDebugEnabled: function() {
		if (this.level.valueOf() <= log4js.Level.DEBUG.valueOf()) {
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
			this.log(log4js.Level.DEBUG, message, null);
		}
	},
	/**
	 * Debug messages
	 * @param {Object} message  message to be logged
	 * @param {Throwable} throwable
	 */
	debug: function(message, throwable) {
		if (this.isDebugEnabled()) {
			this.log(log4js.Level.DEBUG, message, throwable);
		}
	},
	/** checks if Level Info is enabled */
	isInfoEnabled: function() {
		if (this.level.valueOf() <= log4js.Level.INFO.valueOf()) {
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
			this.log(log4js.Level.INFO, message, null);
		}
	},
	/**
	 * logging info messages
	 * @param {Object} message  message to be logged
	 * @param {Throwable} throwable
	 */
	info: function(message, throwable) {
		if (this.isInfoEnabled()) {
			this.log(log4js.Level.INFO, message, throwable);
		}
	},
	/** checks if Level Warn is enabled */
	isWarnEnabled: function() {
		if (this.level.valueOf() <= log4js.Level.WARN.valueOf()) {
			return true;
		}
		return false;
	},

	/** logging warn messages */
	warn: function(message) {
		if (this.isWarnEnabled()) {
			this.log(log4js.Level.WARN, message, null);
		}
	},
	/** logging warn messages */
	warn: function(message, throwable) {
		if (this.isWarnEnabled()) {
			this.log(log4js.Level.WARN, message, throwable);
		}
	},
	/** checks if Level Error is enabled */
	isErrorEnabled: function() {
		if (this.level.valueOf() <= log4js.Level.ERROR.valueOf()) {
			return true;
		}
		return false;
	},
	/** logging error messages */
	error: function(message) {
		if (this.isErrorEnabled()) {
			this.log(log4js.Level.ERROR, message, null);
		}
	},
	/** logging error messages */
	error: function(message, throwable) {
		if (this.isErrorEnabled()) {
			this.log(log4js.Level.ERROR, message, throwable);
		}
	},
	/** checks if Level Fatal is enabled */
	isFatalEnabled: function() {
		if (this.level.valueOf() <= log4js.Level.FATAL.valueOf()) {
			return true;
		}
		return false;
	},
	/** logging fatal messages */
	fatal: function(message) {
		if (this.isFatalEnabled()) {
			this.log(log4js.Level.FATAL, message, null);
		}
	},
	/** logging fatal messages */
	fatal: function(message, throwable) {
		if (this.isFatalEnabled()) {
			this.log(log4js.Level.FATAL, message, throwable);
		}
	},

	setDateFormatter: function(formatFunction) {
	 	this.dateformatter = formatFunction;
	},

	getFormattedTimestamp: function(date) {
	  return this.dateformatter(date);
	}
};




/**
 * Abstract base class for other appenders.
 * It is doing nothing.
 *
 * @constructor
 * @param {log4js.Logger} logger log4js instance this appender is attached to
 * @author Stephan Strittmatter
 */
log4js.Appender = function () {
	/**
	 * Reference to calling logger
	 * @type log4js.Logger
	 * @private
	 */
	 this.logger = null;
};

log4js.Appender.prototype = {
	/**
	 * appends the given loggingEvent appender specific
	 * @param {log4js.LoggingEvent} loggingEvent loggingEvent to append
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
	 * @param {log4js.Layout} layout Layout for formatting loggingEvent
	 */
	setLayout: function(layout){
		this.layout = layout;
	},
	/**
	 * Set reference to the logger.
	 * @param {log4js.Logger} the invoking logger
	 */
	setLogger: function(logger){
		// add listener to the logger methods
		logger.onlog.addListener(log4js.bind(this.doAppend, this));
		logger.onclear.addListener(log4js.bind(this.doClear, this));

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
log4js.Layout = function(){};
log4js.Layout.prototype = {
	/**
	 * Implement this method to create your own layout format.
	 * @param {log4js.LoggingEvent} loggingEvent loggingEvent to format
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
 * AJAX Appender sending {@link log4js.LoggingEvent}s asynchron via
 * <code>XMLHttpRequest</code> to server.<br />
 * The {@link log4js.LoggingEvent} is POSTed as response content and is
 * formatted by the accociated layout. Default layout is {@link log4js.XMLLayout}.
 * The <code>threshold</code> defines when the logs
 * should be send to the server. By default every event is sent on its
 * own (threshold=1). If it is set to 10, then the events are send in groups of
 * 10 events.
 *
 * @extends log4js.Appender
 * @constructor
 * @param {log4js.Logger} logger log4js instance this appender is attached to
 * @param {String} loggingUrl url where appender will post log messages to
 * @author Stephan Strittmatter
 */
log4js.AjaxAppender = function(loggingUrl) {
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
	this.loggingEventBuffer = new log4js.FifoBuffer();
	this.layout = new log4js.JSONLayout();
	this.httpRequest = null;
};

log4js.AjaxAppender.prototype = log4js.extend(new log4js.Appender(), {
	/**
	 * sends the logs to the server
	 * @param loggingEvent event to be logged
	 * @see log4js.Appender#doAppend
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
	 	return "log4js.AjaxAppender[loggingUrl=" + this.loggingUrl + ", threshold=" + this.threshold + "]";
	 }
});



/**
 * JS Console Appender writes the logs to the JavaScript console
 * @constructor
 * @extends log4js.Appender
 * @param logger log4js instance this appender is attached to
 * @author Nils Lundquist
 */
log4js.JSConsoleAppender = function() {
	this.layout = new log4js.BasicLayout();
};

log4js.JSConsoleAppender.prototype = log4js.extend(new log4js.Appender(), {
	doAppend: function(loggingEvent) {
		console.log(
            this.layout.getHeader(),
            this.layout.format(loggingEvent),
            this.layout.getFooter()
        );
	},

	 toString: function() {
	 	return "log4js.JSConsoleAppender";
	 }
});



/**
 * JS Alert Appender writes the logs to the JavaScript alert dialog box
 * @constructor
 * @extends log4js.Appender
 * @param logger log4js instance this appender is attached to
 * @author S&eacute;bastien LECACHEUR
 */
log4js.JSAlertAppender = function() {
	this.layout = new log4js.BasicLayout();
};

log4js.JSAlertAppender.prototype = log4js.extend(new log4js.Appender(), {
	/**
	 * @see log4js.Appender#doAppend
	 */
	doAppend: function(loggingEvent) {
		alert(this.layout.getHeader() + this.layout.format(loggingEvent) + this.layout.getFooter());
	},

	/**
	 * toString
	 */
	 toString: function() {
	 	return "log4js.JSAlertAppender";
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
 * @extends log4js.Layout
 * @author Stephan Strittmatter
 */
log4js.BasicLayout = function() {
	this.LINE_SEP  = "\n";
};

log4js.BasicLayout.prototype = log4js.extend(new log4js.Layout(), {
	/**
	 * Implement this method to create your own layout format.
	 * @param {log4js.LoggingEvent} loggingEvent loggingEvent to format
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
 * @extends log4js.Layout
 * @author Stephan Strittmatter
 */
log4js.JSONLayout = function() {};
log4js.JSONLayout.prototype = log4js.extend(new log4js.Layout(), {
	/**
	 * Implement this method to create your own layout format.
	 * @param {log4js.LoggingEvent} loggingEvent loggingEvent to format
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
		jsonString += "\t\"timestamp\": \"" +  loggingEvent.startTime.toString() + "\",\n";
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
		return "{\"log4js\": [\n";
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
 * internal Logger to be used
 * @private
 */
var log4jsLogger = log4js.getLogger("log4js");
log4jsLogger.addAppender(new log4js.JSConsoleAppender());
log4jsLogger.setLevel(log4js.Level.OFF);
