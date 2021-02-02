import React, { Component } from 'react';

import Toc from './components/toc';
import ReadContent from './components/read_content';
import CreateContent from './components/create_content';
import UpdateContent from './components/update_content';
import Subject from './components/subject';
import Control from './components/control';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: 'welcome', //'read', 'create', 'welcome'
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
  getReadContent() {
    for(let i=0; i<this.state.contents.length;i++) {
      let content = this.state.contents[i];
      if(content.id == this.state.selected_content_id) {
        return content;
      }
    }
  }
  getContent() {
    let _title, _desc, _article;
    if(this.state.mode == 'welcome') {
      _title = this.state.welcome.title;
      _desc = this.state.welcome.desc;
      _article = <ReadContent title={_title} desc={_desc}></ReadContent>;
    } else if(this.state.mode == 'read') {
      let read = this.getReadContent();
      _article = <ReadContent title={read.title} desc={read.desc}></ReadContent>;
    } else if(this.state.mode == 'create') {
      _article = <CreateContent onSubmitChange={function(_title, _desc) {
        /* this.state.contents.push( // push 원본 데이터 변경
          {id: (this.state.contents.length + 1), title: _title, desc: _desc }
        );
        this.setState({
          contents: this.state.contents
        }); */
        /* let _contents = this.state.contents.concat( // concat 원본 데이터 유지하기
          {id: (this.state.contents.length + 1), title: _title, desc: _desc}
        );
        this.setState({
          contents: _contents
        }); */
        let _contents = Array.from(this.state.contents); // 데이터 복제후 처리
        _contents.push({id: (this.state.contents.length + 1), title: _title, desc: _desc});
        this.setState({
          contents: _contents,
          mode: 'read',
          selected_content_id: (this.state.contents.length + 1)
        });
      }.bind(this)}></CreateContent>;
    } else if(this.state.mode == 'update') {
      let read = this.getReadContent();
      _article = <UpdateContent data={read} onSubmitChange={function(_id, _title, _desc) {
        let _contents = Array.from(this.state.contents);
        for(let i=0; i<_contents.length;i++) {
          if(_contents[i].id == _id) {
            _contents[i] = {id: _id, title: _title, desc: _desc};
            break;
          }
        }
        this.setState({
          contents: _contents,
          mode: 'read',
        })
      }.bind(this)}></UpdateContent>
    }
    return _article;
  }
  render() {
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
        <Control
          mode={this.state.mode}
          onChangeMode={function(_mode) {
            if(_mode == 'delete') {
              if(window.confirm('really?')) {
                let _contents = Array.from(this.state.contents);
                for(let i=0; i<_contents.length; i++) {
                  if(_contents[i].id === Number(this.state.selected_content_id)) {
                    _contents.splice(i, 1);
                    break;
                  }
                }
                this.setState({ mode: 'welcome', contents: _contents });
              }
            } else {
              this.setState({ mode: _mode });
            }
          }.bind(this)}
        ></Control>
        {this.getContent()}
      </div>
    );
  }
}

export default App;
