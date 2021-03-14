const signedIn = document.querySelector("#signedIn");
const playedTable = document.querySelector("#playedTable");
const authAnchor = document.querySelector("#authAnchor");
let tableIndex = 1;

//render username to show in header-container
function renderUsername(username) {
  let title = document.createElement("h2");
  let titleText = document.createTextNode("Hello, " + username.split("@")[0]);
  title.setAttribute("class", "m-t-sm");
  title.appendChild(titleText);
  signedIn.appendChild(title);
}

//render played table
function renderPlayedTableItem(played) {
  let tableRow = document.createElement("tr");
  let tableNum = document.createElement("th");
  tableNum.setAttribute("scope", "row");
  let tablePuzzleId = document.createElement("td");
  let tableTime = document.createElement("td");

  let indexText = document.createTextNode(tableIndex);
  let puzzleIdText = document.createTextNode(played.gameId);
  let timeText = document.createTextNode(played.time + " seconds");
  tableNum.appendChild(indexText);
  tablePuzzleId.appendChild(puzzleIdText);
  tableTime.appendChild(timeText);

  tableRow.appendChild(tableNum);
  tableRow.appendChild(tablePuzzleId);
  tableRow.appendChild(tableTime);
  playedTable.appendChild(tableRow);
  tableIndex += 1;
}

async function renderProfile() {
  signedIn.innerHTML = "";
  authAnchor.innerHTML = "";
  const resRaw = await fetch("/getUser");
  const res = await resRaw.json();

  //add username display
  renderUsername(res.username);

  //add played table
  res.played.sort(function (a, b) {
    return a.gameId - b.gameId;
  });
  res.played.forEach(renderPlayedTableItem);

  //add login/logout button to NavBar
  if (res.username != null) {
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

renderProfile();
