var app = require('../app');

var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(80);


//loading  auction data from json
var auctionInfo = require('../data/auction_settings');
var auctTimeSetts = auctionInfo.auctSettings;
var paintings = [];
var auctMembers = [];
for (key in auctionInfo.paintings) {
    auctionInfo.paintings[key].ind = Number(key);
    paintings.push(auctionInfo.paintings[key]);
}
for (key in auctionInfo.auctMembers) {
    auctionInfo.auctMembers[key].ind = Number(key);
    auctMembers.push(auctionInfo.auctMembers[key]);
}
console.log('myDATA', auctTimeSetts, paintings);
//end of loading data


io.sockets.on('connection', (socket) => {
    socket.on('hello', (msg) => {
        let time = (new Date()).toLocaleTimeString();
        socket['name'] = msg.name;
        send(socket, `${msg.name} присоединился`, `${time}`)
    });
    socket.on('msg', (msg) => {
        let time = (new Date()).toLocaleTimeString();
        send(socket, `${socket['name']}: ${msg.value}`, `${time}`);
    });
    socket.on('disconnect', (msg) => {
        if (socket['name']) {
            let time = (new Date()).toLocaleTimeString();
            send(socket, `${socket['name']} вышел`, `${time}`);
        }
    });
    socket.on('startauction', (msg) => {
        socket.broadcast.emit('startauction', {
            time: msg.time,
            name: paintings[msg.ind].name,
            author: paintings[msg.ind].author,
            imgsrc: paintings[msg.ind].imgPath,
            disc: paintings[msg.ind].discription
        });
    });
});

function send(socket, msg, time) {
    socket.json.emit('msg', {'message': msg, 'time': time});
    socket.broadcast.emit('msg', {'message': msg, 'time': time});
}