import React, { Component } from 'react';

class Toc extends Component {
  render() {
    let list = [];
    let data = this.props.data;
    for(let i=0; i<data.length; i++) {
      list.push(<li key={data[i].id}>
        <a href={"/content/"+data[i].id+".html"}
          data-id={data[i].id}
          onClick={
            function(e) {
              e.preventDefault();
              this.props.onChange(e.target.dataset.id);
            }.bind(this)
          }
        >{data[i].title}</a></li>);
    }
    return (
      <nav>
        <ul>
          {list}
        </ul>
      </nav>
    );
  }
}

  
export default Toc;
