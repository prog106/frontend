import React, { Component } from 'react';

class UpdateContent extends Component {
  constructor(props) {
    super(props);
    this.state = { // 원본 데이터는 유지
      id: this.props.data.id,
      title: this.props.data.title,
      desc: this.props.data.desc,
    }
    this.setStateHandler = this.setStateHandler.bind(this);
  }
  setStateHandler(e) {
    this.setState({
      [e.target.name]: e.target.value
    })
  }
  render() {
    return (
      <article>
        <h2>Update</h2>
        <form action="/update_process" method="post"
          onSubmit={function(e) {
            e.preventDefault();
            this.props.onSubmitChange(
              this.state.id,
              this.state.title,
              this.state.desc
            );
          }.bind(this)}
        >
          <input type="hidden" name="id" value={this.state.id}></input>
          <p><input type="text" name="title" placeholder="title" value={this.state.title}
            onChange={this.setStateHandler}
          ></input></p>
          <p><textarea name="desc" placeholder="description" value={this.state.desc}
            onChange={this.setStateHandler}
          ></textarea></p>
          <p><input type="submit"></input></p>
        </form>
      </article>
    );
  }
}

export default UpdateContent;
