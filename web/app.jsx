'use babel';

import React from 'react';
import Clock from './clock/clock.jsx';
import Weather from './weather/weather.jsx'

export default class App extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
        <div className='row'>

          <div className='col-md-4 module'><Clock face='analog'/></div>

          <div className='col-md-4'></div>

          <div className='col-md-4 module'><Weather /></div>

        </div>
    );
  }
}
