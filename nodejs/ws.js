/* const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
    //res.statusCode = 200;
    //res.setHeader('Content-Type', 'text/plain');
    res.writeHead(200, {'Content-Type': 'text/plain'})
    res.end('Hello World');
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
 */

let WebSocketServer = require('ws').Server;
let ws = new WebSocketServer({ port: 3001 });

ws.on('connection', function(ws) {
    ws.send('Welcome! WebSocket Server!');
    ws.on('message', function(message) {
        console.log('Client message : %s', message);
        if(message) {
            // ws.send(message);
            ws.send('응');
        } else {
            ws.send('안들려');
        }
    });
});
