'use babel';

import React from 'react';
import moment from 'moment';

export default class SimpleDigital extends React.Component {

  constructor(props) {
    super(props);

    this.timeFormat = 'h:mm'; //a
    this.dateFormat = 'ddd, MMM D';

    var now = moment();
    this.state = {
      time : now.format(this.timeFormat),
      date : now.format(this.dateFormat),
      showSeparator : true
    };

  }

  componentDidMount() {
    this.timerID = setInterval(() => this.tick(), 1000)
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    var now = moment();
    this.setState(prevState => ({
      time : now.format(this.timeFormat),
      date : now.format(this.dateFormat),
      showSeparator : !prevState.showSeparator
    }));
  }

  render() {

    var split = this.state.time.split(':');
    var h = split[0];
    var m = split[1];

    return (
      <div className='clock-digital'>
        <div className='clock-digital-time'>
          <span>{h}</span>
          <span className={'clock-digital-time-sep-' + (this.state.showSeparator ? 'on' : 'off')}>{':'}</span>
          <span>{m}</span>
        </div>
        <div className='clock-digital-date'>{this.state.date}</div>
      </div>
    );
  }
}
