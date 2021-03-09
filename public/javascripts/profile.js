const signedIn = document.querySelector("#signedIn");
const playedList = document.querySelector("#playedList");

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
  const resRaw = await fetch("/getUser");
  const res = await resRaw.json();

  console.log("Got data", res);

  renderUsername(res.username);
  res.played.forEach(renderPlayedList);
  //res.user will get user info
  console.log(res.username);
}

getUsername();
