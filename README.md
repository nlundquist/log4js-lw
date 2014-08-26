# Log4JS Lightweight 

This derivation of the Log4JS library provides a simple Log4j like interface for logging in the browser.
This project was started to reduce the complexity, remove the burdensome legacy support and add modularity to 
the [original Log4J browser project](https://github.com/stritti/log4js) created and maintained by stritti.

## Usage

To initialize loggers:

```
# init loggers
error_logger = log4js.getLogger('browser-error');
tracking_logger = log4js.getLogger('browser-tracking');

# set minimum level log shipped by loggers (optional)
error_logger.setLevel(log4js.Level.ERROR);
tracking_logger.setLevel(log4js.Level.INFO);

# add additional fields to log via handler (optional, used by GELFAppender)
addUserAndClient = function(log) {
  log.extra.user = app.user.full_name;
  log.extra.client = window.location.host.split('.')[0];
}
error_logger.onlog.addListener(addUserAndClient);
tracking_logger.onlog.addListener(addUserAndClient);

# add appender defining destination for logs
error_logger.addAppender(new log4js.GELFAppender('http://log.myhost.com/gelf'))
tracking_logger.addAppender(new log4js.GELFAppender('http://log.myhost.com/gelf'))
```

To later log via one of the loggers:

```
log4js.getLogger('browser-error').error(
    'Initial site loading has caused an error.'
)
```

## Included Appenders

The appenders included with this library are rudimentary, allowing only logging via browser alerts and the JS console.
It's not the goal of this library to implement and maintain adaptors to various logging backends but to provide a simple
and easy to extend interface to suit the needs of the average browser logging case.

## Available Appenders

Compatible appenders include those in the original Log4JS distribution and the following projects:
[Log4JS-LW GELF Log Appender](https://github.com/nlundquist/log4js-gelf-appender)

## Support
IE8+, Chrome, Firefox, Safari, Opera, iOS 6.1+, Android 4.0+
Where no version is noted the two most recent versions are supported.