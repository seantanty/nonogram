console.log("Front!");

const divFiles = document.querySelector("#files");
const authAnchor = document.querySelector("#authAnchor");

function appendAuth() {
  const login = document.createElement("a");
  let loginText = document.createTextNode("Login");
  login.appendChild(loginText);
  login.setAttribute("class", "btn btn-outline-primary");
  login.setAttribute("href", "/login.html");
  authAnchor.appendChild(login);

  const logout = document.createElement("a");
  let logoutText = document.createTextNode("LogOut");
  logout.appendChild(logoutText);
  logout.setAttribute("class", "btn btn-outline-primary");
  logout.setAttribute("href", "/logout");
  authAnchor.appendChild(logout);
}

async function deleteFile(file) {
  // Default options are marked with *
  const resRaw = await fetch("/deleteFile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(file), // body data type must match "Content-Type" header
  });
  const res = await resRaw.json(); // parses JSON response into native JavaScript objects

  console.log("delete", res);

  reloadFiles();
}

function renderFile(file) {
  const divFile = document.createElement("div");

  divFile.className = "file card p-1 col-3";

  const divName = document.createElement("div");
  divName.textContent = file.name;
  divFile.appendChild(divName);

  const textDisplay = document.createElement("p");
  let desText = document.createTextNode(file.text);
  textDisplay.appendChild(desText);
  divFile.appendChild(textDisplay);

  const btnDelete = document.createElement("button");
  btnDelete.textContent = "X";
  btnDelete.className = "btn btn-danger";
  btnDelete.addEventListener("click", () => deleteFile(file));
  divFile.appendChild(btnDelete);

  divFiles.appendChild(divFile);
}

async function reloadFiles() {
  divFiles.innerHTML = "";
  const resRaw = await fetch("/getFiles");
  const res = await resRaw.json();

  console.log("Got data", res);

  res.files.forEach(renderFile);
}

reloadFiles();
appendAuth();
