import React, { Component } from 'react';

class Control extends Component {
  getCreate() {
    return this.props.mode == 'read' ? '' : <li><a href="/create" onClick={function(e) {
      e.preventDefault();
      this.props.onChangeMode('create');
    }.bind(this)}>create</a></li>;
  }
  getUpdate() {
    return this.props.mode == 'read' ? <li><a href="/update" onClick={function(e) {
      e.preventDefault();
      this.props.onChangeMode('update');
    }.bind(this)}>update</a></li> : '';
  }
  getDelete() {
    return this.props.mode == 'read' ? <li><input type="button" value="delete" onClick={function(e) {
      e.preventDefault();
      this.props.onChangeMode('delete');
    }.bind(this)}></input></li> : '';
  }
  render() {
    return (
      <ul>
        {this.getCreate()}
        {this.getUpdate()}
        {this.getDelete()}
      </ul>
    );
  }
}

export default Control;
