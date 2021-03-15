const authAnchor = document.querySelector("#authAnchor");
const divBoards = document.querySelector("#boards");
const formPuzzle = document.getElementById("searchForm");
formPuzzle.addEventListener("submit", displaySearchBoard);

//add login/logout button to NavBar
async function appendAuth() {
  authAnchor.innerHTML = "";
  const userRaw = await fetch("/getUser");
  const user = await userRaw.json();

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
    login.setAttribute("href", "/login");
    authAnchor.appendChild(login);
  }
}

function tableCreate(lb, divBoard) {
  let tbl = document.createElement("table");
  tbl.style.width = "100%";
  tbl.setAttribute(
    "class",
    "table col-sm table-striped table-hover table-bordered border-primary"
  );
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

  divBoard.className = "board p-1 col-4";

  const divName = document.createElement("div");
  divName.style.fontWeight = "50%";
  divName.textContent = "Puzzle Id: " + puzzle.code;
  divBoard.appendChild(divName);

  // get leader board table
  tableCreate(puzzle.leaderBoard, divBoard);

  divLocation.appendChild(divBoard);
}

async function reloadBoards() {
  divBoards.innerHTML = "";
  const resRaw = await fetch("/getPuzzles");
  const res = await resRaw.json();

  for (let i = 0; i < 3; i++) {
    renderBoard(res.puzzles[i], divBoards);
  }
}

async function displaySearchBoard(event) {
  event.preventDefault();

  let puzzleId = document.getElementById("puzzleid").value;

  const resRaw = await fetch("/searchBoard", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ puzzleid: puzzleId }),
  });

  const res = await resRaw.json();

  const divSearchBoard = document.querySelector("#boardSeach");
  divSearchBoard.innerHTML = "";
  let h3 = document.createElement("h3");
  h3.innerHTML = "Your search result:";
  if (res.success == true) {
    divSearchBoard.appendChild(h3);
    renderBoard(res, divSearchBoard);
  } else {
    let h4 = document.createElement("h4");
    h4.innerHTML = "Please enter a valid Puzzle Id.";
    h3.appendChild(h4);
    divSearchBoard.appendChild(h3);
  }
}

appendAuth();
reloadBoards();
