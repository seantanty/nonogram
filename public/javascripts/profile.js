const signedIn = document.querySelector("#signedIn");
const playedList = document.querySelector("#playedList");
const authAnchor = document.querySelector("#authAnchor");

function renderUsername(username) {
  let title = document.createElement("h1");
  let titleText = document.createTextNode("Signed in as " + username);
  title.appendChild(titleText);
  signedIn.appendChild(title);
}

function renderPlayedList(played) {
  let list = document.createElement("li");
  let listText = document.createTextNode(played.gameId + "   " + played.time);
  list.appendChild(listText);
  playedList.appendChild(list);
}

async function getUsername() {
  signedIn.innerHTML = "";
  authAnchor.innerHTML = "";
  const resRaw = await fetch("/getUser");
  const res = await resRaw.json();

  console.log("Got data", res);

  renderUsername(res.username);
  res.played.sort(function (a, b) {
    return a.gameId - b.gameId;
  });
  res.played.forEach(renderPlayedList);

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
  //res.user will get user info
  console.log(res);
}

getUsername();
