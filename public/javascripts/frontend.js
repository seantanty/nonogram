const authAnchor = document.querySelector("#authAnchor");

//add login/logout button to NavBar
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
  let puzzles, puzzle;
  let numRows; // = puzzle.length;
  let board; // = new Array(numRows);
  let tableCells; // = new Array(numRows + 1);
  const tbody = document.querySelector("#game-table-body");

  let solved = false;
  const STATE_UNSELECTED = 0;
  const STATE_SELECTED = 1;
  const STATE_MARKED = 2;
  const SIZE_SMALL = 5;
  const SIZE_MEDIUM = 10;
  const SIZE_LARGE = 15;
  
  let currentSelectState = undefined;

  let timerVar;


  document.getElementById("searchForm").addEventListener("submit", getPlaySave);
  
  document
    .getElementById("small")
    .addEventListener("click", () => playSave(SIZE_SMALL, null));
  document
    .getElementById("medium")
    .addEventListener("click", () => playSave(SIZE_MEDIUM, null));
  document
    .getElementById("large")
    .addEventListener("click", () => playSave(SIZE_LARGE, null));
  
  async function getPlaySave(event) {
    event.preventDefault();

    let puzzleId = document.getElementById("puzzleid").value;
    console.log("Puzzle id: ", puzzleId);

    playSave(null, puzzleId);
  
  }

  document.getElementById("restart").addEventListener("click", () => {
    window.location.reload();
  });

  
  async function playSave(size, puzzleId) {
    let resRaw;
    let idx = 0;
  
    if (size) {
      resRaw = await fetch("/getPuzzlesPlay");
      let res = await resRaw.json();
      puzzles = await res.puzzles;

      if (size === 5) {
        idx = 0;
      }
      if (size === 10) {
        idx = 1;
      }
      if (size === 15) {
        idx = 2;
      }

      puzzle = await puzzles[idx][0];

    } else{
      const resRaw = await fetch("/searchBoard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ puzzleid: puzzleId }),
      });
      const res = await resRaw.json();
      puzzle = await res;
    }

    let puzzle_info = puzzle.info;

    console.log("Get the puzzle", puzzle_info);

    numRows = puzzle_info.length;
    board = new Array(numRows);
    tableCells = new Array(numRows + 1);

    makeTable();
    start();

    function start() {
      makeGame();
      setHints();
      timerVar = setInterval(countTimer, 1000);
    } 

    document.getElementById("submit").addEventListener("click", () => {
      if (solved == true) {
        checkGameAndRecordTime(totalSeconds);
      }
    });


    function countTimer() {
      ++totalSeconds;
      var hour = Math.floor(totalSeconds / 3600);
      var minute = Math.floor((totalSeconds - hour * 3600) / 60);
      var seconds = totalSeconds - (hour * 3600 + minute * 60);
      if (hour < 10) hour = "0" + hour;
      if (minute < 10) minute = "0" + minute;
      if (seconds < 10) seconds = "0" + seconds;
      document.getElementById("timer").innerHTML = "Timer: " + 
        hour + ":" + minute + ":" + seconds;
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
      solved = true;
      console.log("Solving time: ", totalSeconds);
    }

    async function checkGameAndRecordTime(sec) {
      const userRaw = await fetch("/getUser");
      const user = await userRaw.json();

      console.log("Check user", user);

      let lb = puzzle;
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
        if (lb.leaderBoard.length < 10) {
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
                index: 11,
                trim: false,
              }),
            });
            const resLb = await resLbRaw.json();
            console.log(resLb);
          } else {
            let checkIndex = 12;
            for (let i = 0; i < lb.leaderBoard.length; i++) {
              if (lb.leaderBoard[i][1] > totalSeconds) {
                checkIndex = i;
                break;
              }
            }
            if (checkIndex == 12) {
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
          let checkIndex = 11;
          for (let i = 0; i < lb.leaderBoard.length; i++) {
            if (lb.leaderBoard[i][1] > sec) {
              checkIndex = i;
              break;
            }
          }
          if (checkIndex < 10) {
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
      const divLeaderBoard = document.querySelector("#leaderBoardDisplay");
      divLeaderBoard.innerHTML = "";

      const divTime = document.createElement("div");
      divTime.textContent = "You finished the puzzle in " + sec + " seconds.";
      divLeaderBoard.appendChild(divTime);
      
      let p = document.createElement("p");
      p.style.textalign = "center";
      p.style.fontWeight = 1.1;
      p.innerHTML = "Leader Board";
      divLeaderBoard.appendChild(p);

      console.log("Updated puzzle: ", lb);
      renderBoard(lb, divLeaderBoard);
      return lb;
    } 

    function tableCreate(lb, divBoard) {
      let tbl = document.createElement("table");
      tbl.style.width = "100%";
      tbl.setAttribute("border", "1");
      let tbdy = document.createElement("tbody");

      let tr = document.createElement("tr");
      let td = document.createElement("td");
      td.style.fontWeight = "bold";
      td.appendChild(document.createTextNode("Rank"));
      tr.appendChild(td);
      td = document.createElement("td");
      td.style.fontWeight = "bold";
      td.appendChild(document.createTextNode("User"));
      tr.appendChild(td);
      td = document.createElement("td");
      td.style.fontWeight = "bold";
      td.appendChild(document.createTextNode("Time"));
      tr.appendChild(td);
      tbdy.appendChild(tr);

      for (let i = 0; i < lb.length; i++) {
        tr = document.createElement("tr");
        td = document.createElement("td");
        td.appendChild(document.createTextNode(i + 1));
        tr.appendChild(td);
        for (let j = 0; j < 2; j++) {
          td = document.createElement("td");
          td.appendChild(document.createTextNode(lb[i][j]));
          tr.appendChild(td);
        }
        tbdy.appendChild(tr);
      }
      tbl.appendChild(tbdy);
      divBoard.appendChild(tbl);
    }

    function renderBoard(puzzle, divLocation) {
      const divBoard = document.createElement("div");
      divBoard.innerHTML = "";
      divBoard.className = "board p-1 col-3";

      tableCreate(puzzle.leaderBoard, divBoard);

      divLocation.appendChild(divBoard);
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
            isSpot: puzzle_info[i][j] === "1",
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
}


appendAuth();
play();
