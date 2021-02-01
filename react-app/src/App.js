import React, { Component } from 'react';

import Toc from './components/toc';
import Content from './components/content';
import Subject from './components/subject';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: 'welcome', //'read',
      selected_content_id: 0,
      welcome: {
        title: 'Welcome',
        desc: 'Hello, React!!'
      },
      subject: {
        title: 'WEB',
        sub: 'world wide web!'
      },
      contents: [
        { id: 1, title: 'HTML', desc: 'HTML is for information.' },
        { id: 2, title: 'CSS', desc: 'CSS is for design.' },
        { id: 3, title: 'JavaScript', desc: 'JavaScript is for interactive.' }
      ]
    }
  }
  render() {
    let _title, _desc;
    if(this.state.mode == 'welcome') {
      _title = this.state.welcome.title;
      _desc = this.state.welcome.desc;
    } else if(this.state.mode == 'read') {
      for(let i=0; i<this.state.contents.length;i++) {
        let content = this.state.contents[i];
        if(content.id == this.state.selected_content_id) {
          _title = content.title;
          _desc = content.desc;
          break;
        }
      }
    }
    return (
      <div className="App">
        <Subject
          title={this.state.subject.title}
          sub={this.state.subject.sub}
          onChange={function() {
            this.setState({
              mode: 'welcome',
            })
          }.bind(this)}
        ></Subject>
        <Toc
          data={this.state.contents}
          onChange={function(id) {
            this.setState({ mode: 'read', selected_content_id: id });
          }.bind(this)}
        ></Toc>
        <Content title={_title} desc={_desc}></Content>
      </div>
    );
  }
}

export default App;
