console.log("Leader board!");

/*display popular boards*/
const divBoards = document.querySelector("#boards");

function tableCreate(lb, divBoard) {
  var tbl = document.createElement("table");
  tbl.style.width = "100%";
  tbl.setAttribute("border", "1");
  var tbdy = document.createElement("tbody");
  
  var tr = document.createElement("tr");
  var td = document.createElement("td");
  td.appendChild(document.createTextNode("Rank"));
  tr.appendChild(td);
  td = document.createElement("td");
  td.appendChild(document.createTextNode("User"));
  tr.appendChild(td);
  td = document.createElement("td");
  td.appendChild(document.createTextNode("Time"));
  tr.appendChild(td);
  tbdy.appendChild(tr);

  for (var i = 0; i < lb.length; i++) {
    tr = document.createElement("tr");
    td = document.createElement("td");
    td.appendChild(document.createTextNode(i + 1));
    tr.appendChild(td);
    for (var j = 0; j < 2; j++) {
      td = document.createElement("td");
      td.appendChild(document.createTextNode(lb[i][j]));
      tr.appendChild(td);
    }     
    tbdy.appendChild(tr);
  }
  tbl.appendChild(tbdy);
  divBoard.appendChild(tbl);
}

function renderBoard(puzzle) {
  const divBoard = document.createElement("div");

  divBoard.className = "board p-1 col-3";

  const divName = document.createElement("div");
  divName.textContent = puzzle._id;
  divBoard.appendChild(divName);

  // get leader board table
  tableCreate(puzzle.leaderBoard, divBoard);

  divBoards.appendChild(divBoard);
}

async function reloadBoards(){
  divBoards.innerHTML = "";
  const resRaw = await fetch("/getPuzzles");
  const res = await resRaw.json();
  console.log("Got data", res);

  res.puzzles.forEach(renderBoard);
}

reloadBoards();


/*Display search board if event invokes*/
//var smit = document.getElementById("smit");

async function displaySearchBoard() {
  const resRaw = await fetch("/searchBoard");
  const res = await resRaw.json();
  console.log("Got search data", res);

  renderBoard(res.puzzle);
}

//smit.addEventListener("click", displaySearchBoard, false);











//function displayBoard(board) {}







