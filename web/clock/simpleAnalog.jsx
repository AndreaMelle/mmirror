'use babel';

import React from 'react';
import moment from 'moment';

// Better animations described here https://cssanimation.rocks/clocks/
// with bounce

export default class SimpleAnalog extends React.Component {

  constructor(props) {
    super(props);

    this.dateFormat = 'ddd, MMM D';

    var now = moment();

    this.state = {
      second : now.second(),
      minute : now.minute(),
      hour : now.hour(),
      date : now.format(this.dateFormat)
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
      second : now.second(),
      minute : now.minute(),
      hour : now.hour(),
      date : now.format(this.dateFormat)
    }));
  }

  render() {

    var sRot = this.state.second * 6;
    var mRot = this.state.minute * 6 + this.state.second / 60;
    var hRot = ((this.state.hour % 12) / 12) * 360 + 90 + this.state.minute / 12;

    return (
      <div className="clock-analog">
        <div className="clock-analog-circle">
          <div className="clock-analog-face">
            <div className="clock-analog-hour" style={{transform: "rotateZ(" + hRot + "deg)"}}></div>
            <div className="clock-analog-minute" style={{transform: "rotateZ(" + mRot + "deg)"}}></div>
            <div className="clock-analog-second" style={{transform: "rotateZ(" + sRot + "deg)"}}></div>
          </div>
        </div>
        <div className='clock-analog-date'>{this.state.date}</div>
      </div>

    );
  }
}
