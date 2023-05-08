const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

let answerCount = 0; // answer 요청 횟수를 저장할 변수
let answerLog = []; // answer 요청을 기록할 배열
const connectedClients = new Set();
let turn = 0;
let positions = [[5, 5], [5, 5], [5, 5], [5, 5]]

let map = new Array(4);
for (let i = 0; i < 4; i++)
  map[i] = new Array(5);

for (let i = 0; i < 4; i++) {
  for (let j = 0; j < 5; j++)
    map[i][j] = new Array(5);  // 5개의 열을 가진 배열을 각 행마다 생성
}

for (let i = 0; i < 4; i++) {
  for (let j = 0; j < 5; j++) {
    for (let k = 0; k < 5; k++) {
      map[i][j][k] = 0;
    }
  }
}



app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/style.css', (req, res) => {
  res.sendFile(__dirname + '/style.css');
});

app.get('/script.js', (req, res) => {
  res.sendFile(__dirname + '/script.js');
});

io.on('connection', (socket) => {
  console.log('New client connected, ID:', socket.id);
  connectedClients.add(socket.id); // 연결된 클라이언트 ID를 Set에 추가

  if (connectedClients.size === 4) {
    console.log('All four players connected!');
    // 4명의 클라이언트가 연결되었으므로, 게임을 시작할 수 있음

    turn++;
    io.emit('playerTurn', turn);
  }
  
  io.to(`${socket.id}`).emit('player', `You are player ${connectedClients.size}`);

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
  socket.on('answer', (msg) => {
    console.log('answer', msg);
    answerCount++; // answer 요청이 들어올 때마다 횟수를 증가시킴
    answerLog.push(msg); // answer 요청을 answerLog 배열에 추가함
    if (answerCount === 4) { // answer 요청이 4회인 경우
      console.log("emit", answerLog);
      io.emit('result', answerLog); // 모든 클라이언트에게 answerLog 배열을 보냄

      let prev = move();
      const eaten = eat();

      let whiteCount = answerLog.filter((elem) => elem === 'white').length;
      let oneMore = false;
      if (whiteCount === 0 || whiteCount === 4)
        oneMore = true;

      io.emit('move', {
        prev: prev,
        curr: positions[turn - 1]
      });

      answerCount = 0; // answerCount를 초기화함
      answerLog = []; // answerLog 배열을 초기화함

      if (eaten || oneMore) {
        io.emit('playerTurn', turn);
      } else {
        if (turn === 4)
          turn = 0;
        turn++;
        io.emit('playerTurn', turn);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected, ID:', socket.id);
    connectedClients.delete(socket.id); // 연결이 끊어진 클라이언트 ID를 Set에서 제거
  });
});



server.listen(3000, () => {
  console.log('listening on *:3000');
});

function move() {
  let idx = turn - 1;
  let position = positions[idx];
  let row = position[0];
  let col = position[1];
  let prev = [row, col];
  let whiteCount = answerLog.filter((elem) => elem === 'white').length;
  if (whiteCount === 0)
    whiteCount = 5;
  
  let rightDown = false;
  if (row === col)
    rightDown = true;
  
  let leftDown = false;
  for (let i = 0; i < 6; i++) {
    if (row === i && col === 6 - 1 - i)
      leftDown = true;
  }
  let right = false;

  while (whiteCount > 0) {
    if (col === 5 && row !== 0) {
      // upward
      row--;
    } else if (row === 0 && col !== 0 && !leftDown) {
      // left
      col--;
    } else if (col === 0 && row !== 5 && !rightDown) {
      // downward
      row++;
    } else if (row === 5) {
      // right
      right = true;
      col++;
    } else if (row === col && rightDown) {
      // right down
      row++;
      col++;
    } else if (leftDown) {
      row++;
      col--;
    }
    whiteCount--;

    if ((row === 5 && col === 5 && (rightDown || right) && whiteCount > 0))
     io.emit("win", "win");
  }

  positions[idx] = [row, col];
  return prev;
}

function eat() {
  let idx = turn - 1;
  let eaten = false;
  
  for (let i = 0; i < 4; i++) {
    if (i === idx)
      continue;
    
    let same = true;
    for (let j = 0; j < 2; j++) {
      if (positions[i][j] !== positions[idx][j])
        same = false;
    }

    if (same) {
      eaten = true;
      positions[i][0] = 5;
      positions[i][1] = 5;
    }
  }
  return eaten;
}