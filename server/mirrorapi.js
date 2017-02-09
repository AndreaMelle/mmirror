var restify = require('restify');
var metoffice = require('./metofficeService.js')

//8f8ff8d0-ca89-4f84-a555-a34d435db28e
//353605

function getWeatherNow(req, res, next) {
  metoffice.weatherNow(function(data, error) {
    if(!error) {
      res.json(data);
      next();
    } else {
      next(error);
    }
  });
}

var server = restify.createServer(
  'name' : 'mirror-api'
);

server.pre(restify.pre.sanitizePath());
server.pre(restify.pre.userAgentConnection());

server.get('/weather/now', getWeatherNow);

server.listen(8080, function() {
  console.log('%s mirror api listening at %s', server.name, server.url);
});

var mirrorapi = function () {};

// mirrorapi.prototype.log = function () {};

module.exports = new mirrorapi();
