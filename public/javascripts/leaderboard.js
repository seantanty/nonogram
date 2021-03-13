console.log("Leader board!");

/*display popular boards*/
const divBoards = document.querySelector("#boards");

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

  const divName = document.createElement("div");
  //divName.style.color = "#ffa500";
  divName.style.fontWeight = "50%";
  divName.textContent = puzzle._id;
  divBoard.appendChild(divName);

  // get leader board table
  tableCreate(puzzle.leaderBoard, divBoard);

  divLocation.appendChild(divBoard);
}

async function reloadBoards() {
  divBoards.innerHTML = "";
  const resRaw = await fetch("/getPuzzles");
  const res = await resRaw.json();
  console.log("Got data", res);

  for (let i = 0; i < 3; i++){
    renderBoard(res.puzzles[i], divBoards);
  }

  //res.puzzles.forEach(renderBoard, divBoards);
}

reloadBoards();

/*Display search board*/
let formPuzzle = document.getElementById("searchForm");
formPuzzle.addEventListener("submit", displaySearchBoard);

async function displaySearchBoard(event) {
  event.preventDefault();

  let puzzleId = document.getElementById("puzzleid").value;
  console.log("Puzzle id: ", puzzleId);

  const resRaw = await fetch("/searchBoard", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ puzzleid: puzzleId }),
  });


  const res = await resRaw.json();
  console.log("Got search data", res);

  const divSearchBoard = document.querySelector("#boardSeach");
  let h3 = document.createElement("h3");
  h3.innerHTML = "Search By Id";
  divSearchBoard.appendChild(h3);
  renderBoard(res, divSearchBoard);

}



