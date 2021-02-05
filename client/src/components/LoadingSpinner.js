import React, { Component } from "react";

import { Spinner } from "react-bootstrap";

class LoadingSpinner extends Component {
  render() {
    return (
      <div>
        <h5> {this.props.msg} </h5> <Spinner animation="border" role="status" />
      </div>
    );
  }
}

export default LoadingSpinner;
