console.log("Front!");

const divFiles = document.querySelector("#files");
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

function renderFile(file) {
  console.log("called");
  const divFile = document.createElement("div");

  divFile.className = "file card p-1 col-3";

  const divName = document.createElement("div");
  divName.textContent = file._id;
  divFile.appendChild(divName);

  const textDisplay = document.createElement("p");
  let desText = document.createTextNode(file.text);
  textDisplay.appendChild(desText);
  divFile.appendChild(textDisplay);

  divFiles.appendChild(divFile);
}

// async function reloadFiles() {
//   divFiles.innerHTML = "";
//   const resRaw = await fetch("/getFiles");
//   const res = await resRaw.json();

//   console.log("Got data", res);

//   res.files.forEach(renderFile);
// }

// reloadFiles();
appendAuth();
