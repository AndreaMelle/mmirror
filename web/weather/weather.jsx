'use babel';

import React from 'react';
import 'whatwg-fetch';
import WeatherTables from './weatherTables.jsx';
import _ from 'lodash';

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    var error = new Error(response.statusText);
    error.response = response;
    throw error;
  }
};

function parseJson(response) {
  return response.json();
};

export default class Weather extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      hasData : false,
      weather : {}
    };

  }

  componentDidMount() {

    fetch('http://localhost:8080/weather/now')
    .then(checkStatus)
    .then(parseJson)
    .then(data => {

      if(!_.isUndefined(data) && !_.isEmpty(data)) {
        console.log(data);
        this.setState({
          weather : data,
          hasData : true
        });
      }

    })
    .catch(function(error) {
      console.log('request failed', error);
    });
  }

  componentWillUnmount() {}

  formatT(t) {
    return (t + String.fromCharCode(176));
  }

  render() {
    var weather = this.state.weather;

    if(!this.state.hasData || !weather || _.isEmpty(weather)) {
      return null;
    }

    return (
      <div className='row weather-container'>
        <div className='col-md-6 weather-icon'><i className={'wi ' + _.get(WeatherTables.WeatherIcons, weather.code)}></i></div>
        <div className='col-md-6'>
          <div className='weather-temperature-now'>{this.formatT(weather.tempNow)}</div>
          <div className='weather-description-now'>{_.get(WeatherTables.WeatherDescr, weather.code)}</div>
          <div className='weather-temperature-highlow'>{this.formatT(weather.tempLo) + ' / ' + this.formatT(weather.tempHi)}</div>
        </div>
      </div>
    );
  }
}
