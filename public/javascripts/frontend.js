console.log("Front!");

const authAnchor = document.querySelector("#authAnchor");

async function appendAuth() {
  authAnchor.innerHTML = "";
  const userRaw = await fetch("/getUser");
  const user = await userRaw.json();

  console.log("Check user", user);

  if (user.username != null) {
    const logout = document.createElement("a");
    let logoutText = document.createTextNode("LogOut");
    logout.appendChild(logoutText);
    logout.setAttribute("class", "btn btn-outline-primary");
    logout.setAttribute("href", "/logout");
    authAnchor.appendChild(logout);
  } else {
    const login = document.createElement("a");
    let loginText = document.createTextNode("Login");
    login.appendChild(loginText);
    login.setAttribute("class", "btn btn-outline-primary");
    login.setAttribute("href", "/login.html");
    authAnchor.appendChild(login);
  }
}

let totalSeconds = 0;
async function play() {
  // get a puzzle
  const resRaw = await fetch("/getPuzzlesPlay");
  const res = await resRaw.json();
  const puzzles = await res.puzzles;
  //console.log("Got puzzles", puzzles);
  let idx = Math.floor(Math.random() * 3);
  let puzzleWhole = puzzles[idx][0];
  console.log("Get whole info of the selected puzzle ", puzzleWhole);
  let puzzle = puzzleWhole.info;
  console.log("Get the puzzle", puzzle);

  // play puzzle
  //const divPuzzle = document.querySelector("#puzzle");
  const STATE_UNSELECTED = 0;
  const STATE_SELECTED = 1;
  const STATE_MARKED = 2;
  //var size = getRVBN("size");
  let numRows = puzzle.length;
  console.log("puzzle size", numRows);
  const board = new Array(numRows);
  const tableCells = new Array(numRows + 1);
  const tbody = document.querySelector("#game-table-body");

  let currentSelectState = undefined;

  let timerVar;

  document.getElementById("restart").addEventListener("click", () => {
    window.location.reload();
  });

  makeTable();
  start();

  function start() {
    /*switch (difficulty) {
            case EASY_DIFFICULTY:
                percentSpots = EASY_PERCENT;
                break;
            case MEDIUM_DIFFICULTY:
                percentSpots = MEDIUM_PERCENT;
                break;
            case HARD_DIFFICULTY:
                percentSpots = HARD_PERCENT;
                break;
            default:
                start(DEFAULT_DIFFICULTY);
                break;
        }*/

    makeGame();
    setHints();
    timerVar = setInterval(countTimer, 1000);
    //reset();
  }

  function countTimer() {
    ++totalSeconds;
    var hour = Math.floor(totalSeconds / 3600);
    var minute = Math.floor((totalSeconds - hour * 3600) / 60);
    var seconds = totalSeconds - (hour * 3600 + minute * 60);
    if (hour < 10) hour = "0" + hour;
    if (minute < 10) minute = "0" + minute;
    if (seconds < 10) seconds = "0" + seconds;
    document.getElementById("timer").innerHTML =
      "Timer: " + hour + ":" + minute + ":" + seconds;
  }

  function checkForWin() {
    for (let i = 1; i < numRows + 1; i++) {
      for (let j = 1; j < numRows + 1; j++) {
        //let tableCell = tableCells[i][j];
        let cell = board[i - 1][j - 1];
        if (
          (cell.isSpot && cell.selectedState !== STATE_SELECTED) ||
          (!cell.isSpot && cell.selectedState === STATE_SELECTED)
        ) {
          return;
        }
      }
    }

    // give enough time for css of last cell to update
    setTimeout(() => alert("You win!"), 50);
    clearInterval(timerVar);
    console.log("Solving time: ", totalSeconds);
    checkGameAndRecordTime(totalSeconds);
  }

  async function checkGameAndRecordTime(sec) {
    const userRaw = await fetch("/getUser");
    const user = await userRaw.json();

    console.log("Check user", user);

    let lb = puzzles[idx][0];
    console.log(lb);
    console.log("Time stop" + sec);

    if (user.username != null) {
      //first store time and puzzle id to user
      const resRaw = await fetch("/saveTimeToUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: user.username,
          puzzleCode: lb.code,
          time: sec,
        }),
      });
      const res = await resRaw.json();
      console.log(res);
      //if leaderboard.size<5, change res.leaderboard and record to leaderboard
      if (lb.leaderBoard.length < 5) {
        if (lb.leaderBoard.length == 0) {
          const resLbRaw = await fetch("/saveToLeaderBoard", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: user.username,
              puzzleId: lb._id,
              time: sec,
              index: 6,
              trim: false,
            }),
          });
          const resLb = await resLbRaw.json();
          console.log(resLb);
        } else {
          let checkIndex = 7;
          for (let i = 0; i < lb.leaderBoard.length; i++) {
            if (lb.leaderBoard[i][1] > totalSeconds) {
              checkIndex = i;
              break;
            }
          }
          if (checkIndex == 7) {
            checkIndex = lb.leaderBoard.length;
          }
          const resLbRaw = await fetch("/saveToLeaderBoard", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: user.username,
              _id: lb._id,
              time: sec,
              index: checkIndex,
              trim: false,
            }),
          });
          const resLb = await resLbRaw.json();
          console.log(resLb);
        }
      } else {
        let checkIndex = 6;
        for (let i = 0; i < lb.leaderBoard.length; i++) {
          if (lb.leaderBoard[i][1] > sec) {
            checkIndex = i;
            break;
          }
        }
        if (checkIndex < 5) {
          const resLbRaw = await fetch("/saveToLeaderBoard", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: user.username,
              _id: lb._id,
              time: sec,
              index: checkIndex,
              trim: true,
            }),
          });
          const resLb = await resLbRaw.json();
          console.log(resLb);
        }
      }
    }
    //display user's time and leaderboard
    //You finished puzzle in xxx seconds
    //show the leaderboard
    return lb;
  }

  // updates game cells, not info cells
  function updateTable() {
    for (let i = 1; i < numRows + 1; i++) {
      for (let j = 1; j < numRows + 1; j++) {
        let tableCell = tableCells[i][j];
        let cell = board[i - 1][j - 1];
        if (cell.selectedState === STATE_SELECTED) {
          tableCell.classList.add("checked");
          tableCell.classList.remove("marked");
        } else if (cell.selectedState === STATE_MARKED) {
          tableCell.classList.add("marked");
          tableCell.classList.remove("checked");
        } else {
          tableCell.classList.remove("checked");
          tableCell.classList.remove("marked");
        }
      }
    }
  }

  function setHints() {
    // horizontal
    for (let i = 1; i < numRows + 1; i++) {
      let row = [];
      let count = 0;
      for (let j = 1; j < numRows + 1; j++) {
        let cell = board[i - 1][j - 1];

        if (cell.isSpot) {
          count++;
        } else if (count > 0) {
          row.push(count);
          count = 0;
        }
      }

      if (count > 0) {
        row.push(count);
      }

      let infoCell = tableCells[i][0];
      while (infoCell.firstChild) {
        infoCell.removeChild(infoCell.firstChild);
      }
      let div = document.createElement("div");

      row.forEach((num) => {
        let span = document.createElement("span");
        span.innerHTML = num;
        div.appendChild(span);
      });

      infoCell.appendChild(div);
    }

    // vertical
    for (let j = 1; j < numRows + 1; j++) {
      let col = [];
      let count = 0;
      for (let i = 1; i < numRows + 1; i++) {
        let cell = board[i - 1][j - 1];

        if (cell.isSpot) {
          count++;
        } else if (count > 0) {
          col.push(count);
          count = 0;
        }
      }

      if (count > 0) {
        col.push(count);
      }

      let infoCell = tableCells[0][j];
      while (infoCell.firstChild) {
        infoCell.removeChild(infoCell.firstChild);
      }

      let div = document.createElement("div");
      col.forEach((num) => {
        let span = document.createElement("span");
        span.innerHTML = num;
        div.appendChild(span);
      });

      infoCell.appendChild(div);
    }

    // click listeners
    let spans = document.querySelectorAll(".info-cell span");
    spans.forEach((span) => {
      span.addEventListener("click", (e) => {
        let target = e.target;
        if (target.classList.contains("checked")) {
          target.classList.remove("checked");
        } else {
          target.classList.add("checked");
        }
      });
    });
  }

  function makeGame() {
    for (let i = 0; i < numRows; i++) {
      board[i] = new Array(numRows);
      for (let j = 0; j < numRows; j++) {
        board[i][j] = {
          selectedState: STATE_UNSELECTED,
          isSpot: puzzle[i][j] === "1",
        };
      }
    }
  }

  function makeTable() {
    let mouseoverListener = (e) => {
      let tableCell = e.target;
      let row = tableCell.dataset.row;
      let col = tableCell.dataset.col;
      if (
        row >= 0 &&
        col >= 0 &&
        e.buttons === 1 &&
        currentSelectState !== undefined
      ) {
        e.preventDefault();
        let cell = board[row][col];

        cell.selectedState = currentSelectState;

        updateTable();
        checkForWin();
      }
    };

    for (let i = 0; i < numRows + 1; i++) {
      tableCells[i] = new Array(numRows + 1);
      let row = document.createElement("tr");

      for (let j = 0; j < numRows + 1; j++) {
        let cell = document.createElement("td");
        let isInfoCell = i === 0 || j === 0;
        cell.setAttribute("data-row", i - 1);
        cell.setAttribute("data-col", j - 1);
        let cellClass = isInfoCell ? "info-cell" : "game-cell";
        cell.setAttribute("class", cellClass);
        cell.addEventListener("mouseover", mouseoverListener);
        tableCells[i][j] = cell;
        row.appendChild(cell);
      }

      tbody.appendChild(row);
    }

    document.addEventListener("mousedown", (e) => {
      let tableCell = e.target;
      let row = tableCell.dataset.row;
      let col = tableCell.dataset.col;

      if (row >= 0 && col >= 0) {
        e.preventDefault();
        let cell = board[row][col];

        switch (cell.selectedState) {
          case STATE_UNSELECTED:
            cell.selectedState = STATE_SELECTED;
            break;
          case STATE_SELECTED:
            cell.selectedState = STATE_MARKED;
            break;
          case STATE_MARKED:
            cell.selectedState = STATE_UNSELECTED;
            break;
        }

        currentSelectState = cell.selectedState;

        updateTable();
        checkForWin();
      } else {
        currentSelectState = undefined;
      }
    });
  }
}

appendAuth();
play();
