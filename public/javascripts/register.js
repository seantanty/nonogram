const email = document.querySelector("#userInputEmail");
const password = document.querySelector("#userPassword");
let regExp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

document.getElementById("submitButton").addEventListener("click", () => {
  registerSubmit();
});

export async function registerSubmit() {
  if (email.value.match(regExp)) {
    if (
      password.value === null ||
      password.value === "" ||
      password.value === undefined
    ) {
      alert("Please enter your password.");
      return false;
    } else {
      const resRaw = await fetch("/checkSameUserName", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: email.value }),
      });
      const res = await resRaw.json();
      if (res.same == true) {
        alert("This email has been registered already.");
        return false;
      } else {
        await fetch("/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: email.value,
            password: password.value,
          }),
        }).then((response) => {
          if (response.redirected) {
            window.location.href = response.url;
          }
        });
      }
    }
  } else {
    alert("Please enter a valid e-mail address.");
    return false;
  }
}
