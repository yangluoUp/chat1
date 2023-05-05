const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// 存放已连接的客户端对象和其对应的用户名
const connectedClients = new Map();

io.on('connection', (socket) => {
  console.log(`A new client ${socket.id} connected`);

  // 加入聊天室并记录用户名
  socket.on('join', (username) => {
    console.log(`Client ${socket.id} joined as ${username}`);
    
    connectedClients.set(socket, username);
    io.emit('chat message', `[${getTime()}] ${username} 加入了聊天室`);
  });

  // 监听客户端发送的聊天信息
  socket.on('chat message', (message) => {
    console.log(`Received message: ${message}`);

    const senderName = connectedClients.get(socket);
    if (senderName) {
      io.emit('chat message', `[${getTime()}] ${senderName}: ${message}`);
    }
  });

  // 当 socket 断开连接时触发该事件
  socket.on('disconnect', () => {
    const username = connectedClients.get(socket);
    if (username) {
      console.log(`Client ${socket.id} (${username}) disconnected`);
      connectedClients.delete(socket);
      io.emit('chat message', `[${getTime()}] ${username} left the chat`);
    }
  });

  // 监听客户端发送的图片
  socket.on('chat image', (dataUrl,username) => {
    // console.log(`Received an image: ${dataUrl}`);

    const senderName = connectedClients.get(socket);
    if (senderName) {
        io.emit('chat image', dataUrl, username);
    }
  });
});

// 获取当前时间戳，并格式化成 "YYYY-MM-DD HH:mm:ss" 的形式
function getTime() {
  const date = new Date();
  return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())} ${padZero(date.getHours())}:${padZero(date.getMinutes())}:${padZero(date.getSeconds())}`;
}

// 小于 10 的数字补零
function padZero(number) {
  return number < 10 ? `0${number}` : number;
}

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});