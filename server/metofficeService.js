//http://datapoint.metoffice.gov.uk/public/data/val/wxfcs/all/json/353605?res=daily&key=8f8ff8d0-ca89-4f84-a555-a34d435db28e

var restify = require('restify');
var moment = require('moment');
var _ = require('lodash');

var metoffice = function () {};

var metofficeClient = restify.createJsonClient({
  url: 'http://datapoint.metoffice.gov.uk',
  version: '*'
});

var locationId = '353605';
var key = '8f8ff8d0-ca89-4f84-a555-a34d435db28e';
var weatherPath = '/public/data/val/wxfcs/all/';
var format = 'json';

var dataDatePath = 'SiteRep.DV.dataDate';
var locationIdPath = 'SiteRep.DV.Location.i';
var forecastArrayPath = 'SiteRep.DV.Location.Period';

var queryWeather = function(resource) {
  return new Promise(function(resolve, reject) {
    var url = weatherPath + format + '/' + locationId + '?res=' + resource + '&key=' + key;
    metofficeClient.get(url, function(error, req, res, obj) {
      if(error) { reject(error); }
      else { resolve(obj); }
    });
  });
};

// {
//   "SiteRep": {
//     "Wx": {"Param": []},
//     "DV": {
//       "dataDate": "2017-02-05T18:00:00Z",
//       "type": "Forecast",
//       "Location": {
//         "i": "353605",
//         "Period": [
//           {
//             "type": "Day",
//             "value": "2017-02-05Z",
//             "Rep": [
//               {
//                 "D": "NNE",
//                 "F": "3",
//                 "G": "20",
//                 "H": "83",
//                 "Pp": "8",
//                 "S": "9",
//                 "T": "6",
//                 "V": "MO",
//                 "W": "7",
//                 "U": "1",
//                 "$": "900"
//               },
//               {
//                 "D": "N",
//                 "F": "3",
//                 "G": "18",
//                 "H": "88",
//                 "Pp": "6",
//                 "S": "4",
//                 "T": "5",
//                 "V": "MO",
//                 "W": "7",
//                 "U": "0",
//                 "$": "1080"
//               },
//               {
//                 "D": "NNW",
//                 "F": "3",
//                 "G": "16",
//                 "H": "85",
//                 "Pp": "3",
//                 "S": "7",
//                 "T": "5",
//                 "V": "GO",
//                 "W": "7",
//                 "U": "0",
//                 "$": "1260"
//               }
//             ]
//           },
//
//         ]
//       }
//     }
//   }
// }

var parseWeatherReport = function(obj) {

  return new Promise(function(resolve, reject) {
    if(!_.has(obj, dataDatePath) || !_.has(obj, locationIdPath) || !_.has(obj, forecastArrayPath)) {
      reject(new restify.ResourceNotFoundError('metofficeClient content error'));
    }

    var fcDataDate = moment(_.get(obj, dataDatePath)); // TODO: check date matches today
    var fcLocationId = _.get(obj, locationIdPath);
    var fcArray = _.get(obj, forecastArrayPath);

    if(fcLocationId !== locationId) {
      reject(new restify.ResourceNotFoundError('metofficeClient location mismatch'));
    }

    if(fcArray.length <= 0) {
      reject(new restify.ResourceNotFoundError('metofficeClient no daily forecast available'));
    }

    // Find the first valid entry whose date matches today
    var fcRep = _.find(fcArray, function(fc) {

      if(!_.has(fc, 'type') || !_.has(fc, 'value') || !_.has(fc, 'Rep')) { return false; }
      if(!(_.get(fc, 'type') === 'Day')) { return false; }

      // I think there's an error in API and the ISO 8601 date is dirty
      try {
        var fcDate = moment(_.replace(_.get(fc, 'value'), 'Z', ''));
        return (moment().isSame(fcDate, 'day'));
      } catch(e) { return false; }

    });

    if(_.isUndefined(fcRep)) { reject(new restify.ResourceNotFoundError('metofficeClient no forecast available')); }

    var fcReports = _.get(fcRep, 'Rep'); // reports for today

    resolve(fcReports);

  });

}

var parse3hourlyWeather = function(reports) {

  return new Promise(function(resolve, reject) {

    // We should sort the array by date, but let's assume the first one is what we need
    // TODO: it's not, we really need to check for '$' (minutes after midnight of the considered day)
    // and get the one closely next to current time
    if(reports.length <= 0) {
      reject(new restify.ResourceNotFoundError('metofficeClient no 3hourly forecast available'));
    }

    var rep = reports[0];

    var weatherCode;
    var tempNow;

    if(_.has(rep, 'W')) {
      weatherCode = _.get(rep, 'W');
    } else {
      reject(new restify.ResourceNotFoundError('metofficeClient error parsing daily forecast'));
    }

    if(_.has(rep, 'F')) {
      tempNow = _.get(rep, 'F');
    } else if(_.has(rep, 'T')) {
      tempNow = _.get(rep, 'T');
    } else {
      reject(new restify.ResourceNotFoundError('metofficeClient error parsing daily forecast'));
    }

    resolve({
      code : weatherCode,
      tempNow : tempNow
    });

  });

};

var parseDailyWeather = function(reports) {

  return new Promise(function(resolve, reject) {

    var fcRepDay = _.find(reports, {'$' : 'Day'});
    var fcRepNight = _.find(reports, {'$' : 'Night'});

    if(_.isUndefined(fcRepDay) || _.isUndefined(fcRepNight)) {
      reject(new restify.ResourceNotFoundError('metofficeClient error parsing daily forecast'));
    }

    var dayMax;
    var nightMin;

    // we are only interested in max/min temperature for now
    // $ -> time or date
    // FDm -> Feels Like Day Maximum Temperature in C
    // FNm -> Feels Like Night Minimum Temperature in C
    // Dm -> Day Maximum Temperature in C
    // Nm -> Night Minimum Temperature in C
    // W -> Weather type
    // PPd -> probability precipitation % day
    // PPn -> probability precipitation % night

    if(_.has(fcRepDay, 'FDm')) {
      dayMax = _.get(fcRepDay, 'FDm');
    } else if(_.has(fcRepDay, 'Dm')) {
      dayMax = _.get(fcRepDay, 'Dm');
    } else {
      reject(new restify.ResourceNotFoundError('metofficeClient error parsing daily forecast'));
    }

    if(_.has(fcRepNight, 'FNm')) {
      nightMin = _.get(fcRepNight, 'FNm');
    } else if(_.has(fcRepNight, 'Nm')) {
      nightMin = _.get(fcRepNight, 'Nm');
    } else {
      reject(new restify.ResourceNotFoundError('metofficeClient error parsing daily forecast'));
    }

    resolve({
      tempHi : dayMax,
      tempLo : nightMin,
    });

  });

};

metoffice.prototype.weatherNow = function(callback) {

  var weatherNow = {};

  // TODO: assert cb is function
  queryWeather('daily')
  .then(function(data) {
    return parseWeatherReport(data);
  })
  .then(function(reports) {
    return parseDailyWeather(reports);
  })
  .then(function(dailyW) {
    _.assign(weatherNow, dailyW);
    return queryWeather('3hourly');
  })
  .then(function(data) {
    return parseWeatherReport(data);
  })
  .then(function(reports) {
    return parse3hourlyWeather(reports);
  })
  .then(function(hourlyW) {
    _.assign(weatherNow, hourlyW);
    callback(weatherNow, null);
  })
  .catch(function(error){
    callback(null, error);
  });
};

module.exports = new metoffice();
