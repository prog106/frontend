'use strict';

const e = React.createElement;

class LikeButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = { liked: false };
    }

    render() {
        if (this.state.liked) {
            return 'You liked this.';
        }

        return e(
            'button',
            { onClick: () => this.setState({ liked: true }) },
            'Like'
        );
    }
}

const domContainer = document.querySelector('#like_button_container');
ReactDOM.render(e(LikeButton), domContainer);


function tick() {
    let cont = document.querySelector('#tick_container');
    let tick = React.createElement('h3', '', `It is ${new Date().toLocaleTimeString()}`);
    ReactDOM.render(tick, cont);
}
setInterval(tick, 1000);
