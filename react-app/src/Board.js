import React, { Component } from 'react';

class Board extends Component {
  constructor(props) {
    super(props);
  }
  // componentWillMount() {
  //   console.log('Component WILL MOUNT!');
  // }
  componentDidMount() {
    console.log('Component DID MOUNT!');
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    console.log('Component getDerivedStateFromProps');
  }
  shouldComponentUpdate(nextProps, nextState) {
    console.log('Component SHOULD UPDATE')
    //return true;
  }
  getSnapshotBeforeUpdate(prevProps, prevState) {
    console.log('Component getSnapshotBeforeUpdate')
  }
  componentDidUpdate(prevProps, prevState) {
    console.log('Component DID UPDATE!')
  }
  componentWillUnmount() {
    console.log('Component WILL UNMOUNT!')
  }
  render() {
      return (
          <h1>{this.props.data} Board</h1>
      )
  }
}

export default Board;
