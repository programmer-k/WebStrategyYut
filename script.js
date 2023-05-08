var socket = io();

var messages = document.getElementById('messages');
var form = document.getElementById('form');
var input = document.getElementById('input');
var gameStatus = document.getElementById('gameStatus');
let timer = undefined;
let timeLeft = undefined;
let currentTurn = undefined;

form.addEventListener('submit', function(e) {
  e.preventDefault();
  if (input.value) {
    socket.emit('chat message', input.value);
    input.value = '';
  }
});

socket.on('chat message', function(msg) {
  var item = document.createElement('li');
  item.textContent = msg;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
  messages.scrollTop = messages.scrollHeight;
});

socket.on('result', function(msg) {
  var item = document.createElement('li');
  console.log(typeof(msg));
  const whiteCount = msg.filter((elem) => elem === 'white').length;
  const output = countToString(whiteCount);
  item.textContent = "The result is " + output;
  gameStatus.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
  gameStatus.scrollTop = gameStatus.scrollHeight;
});

socket.on('move', function(msg) {
    const row = msg.curr[0];
    const col = msg.curr[1];
    console.log("row:", row);
    console.log("col:", col);

    let entireRow = document.getElementsByTagName("tr")[row];
    let cell = entireRow.getElementsByTagName("td")[col];
    console.log("currentTurn", currentTurn);

    let color = cell.getElementsByClassName('color' + currentTurn)[0];
    color.classList.remove("disable");
    
    for (let i = 1; i <= 4; i++) {
        if (i === currentTurn) continue;
        color = cell.getElementsByClassName('color' + i)[0];
        color.classList.add("disable");
    }

    const prevRow = msg.prev[0];
    const prevCol = msg.prev[1];
    console.log("prevRow:", prevRow);
    console.log("prevCol:", prevCol);

    entireRow = document.getElementsByTagName("tr")[prevRow];
    cell = entireRow.getElementsByTagName("td")[prevCol];

    color = cell.getElementsByClassName('color' + currentTurn)[0];
    color.classList.add("disable");
});

socket.on('playerTurn', function(turn) {
    currentTurn = turn;
    var item = document.createElement('li');
    item.textContent = `Player ${turn}'s turn`;
    gameStatus.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
    gameStatus.scrollTop = gameStatus.scrollHeight;

    document.getElementById("blackButton").removeAttribute("disabled");
    document.getElementById("whiteButton").removeAttribute("disabled");

    timeLeft = 4;
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById("timer").textContent = timeLeft;
        if (timeLeft === 0) {
            document.getElementById("blackButton").setAttribute("disabled", "disabled");
            document.getElementById("whiteButton").setAttribute("disabled", "disabled");

            const randomChoice = Math.random() < 0.5 ? 'black' : 'white';
            submitAnswer(randomChoice);
        }
    }, 1000);
});

socket.on('player', function(msg) {
    var item = document.createElement('li');
    item.textContent = msg;
    gameStatus.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
    gameStatus.scrollTop = gameStatus.scrollHeight;
  });

socket.on('answer', function(msg) {
  var item = document.createElement('li');
  item.textContent = msg;
  gameStatus.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight)
  gameStatus.scrollTop = gameStatus.scrollHeight;
});

socket.on('win', function(msg) {
    var item = document.createElement('li');
    item.textContent = msg;
    gameStatus.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
    gameStatus.scrollTop = gameStatus.scrollHeight;
  });

socket.on('disconnect', () => {
  // 서버와 연결이 끊어지면 알림 메시지를 표시합니다.
  const disconnectElement = document.createElement('div');
  disconnectElement.innerHTML = `Disconnected from server`;
  document.body.appendChild(disconnectElement);
});



function submitAnswer(color) {
    socket.emit('answer', color);
    clearInterval(timer);
    document.getElementById("blackButton").setAttribute("disabled", "disabled");
    document.getElementById("whiteButton").setAttribute("disabled", "disabled");
    var item = document.createElement('li');
    item.textContent = "You selected: " + color;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
    messages.scrollTop = messages.scrollHeight;
}

function countToString(whiteCount) {
    if (whiteCount === 1)
        return "Do";
    else if (whiteCount === 2)
        return "Gae";
    else if (whiteCount === 3)
        return "Gerl";
    else if (whiteCount === 4)
        return "Yut";
    else if (whiteCount === 0)
        return "Mo";
    else
        return "ERROR";
}

function move(playerID) {

}