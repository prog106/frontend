import React, { Component } from 'react';

class Toc extends Component {
  shouldComponentUpdate(newProps, newState) {
    // console.log(newProps.data, this.props.data); 
    if(newProps.data === this.props.data) { // 이 컴포넌트에서 사용하는 값의 현재값과 바뀐값 비교
      return false; // 데이터가 동일할 경우 render function 호출 불가 처리
    }
    return true; // 데이터가 다를 경우 render function 호출 처리
  }
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
