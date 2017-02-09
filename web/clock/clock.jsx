'use babel';

import React from 'react';
import SimpleDigital from './simpleDigital.jsx';
import SimpleAnalog from './simpleAnalog.jsx';

export default class Clock extends React.Component {

  constructor(props) {
    super(props);

    this.faces = {
        'digital' : (<SimpleDigital />),
        'analog' : (<SimpleAnalog />)
    };
  }

  render() {
    return this.faces[this.props.face];
  }
  
}
