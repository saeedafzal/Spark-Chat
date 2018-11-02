var username;
var logger = id("logger");

function login() {
    username = id("username_input").value;
    var password = id("password_input").value;

    if (username === "" || password === "") {
        logger.innerHTML += "Enter all fields.<br>";
        return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:4567/login");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            console.log("Received data: " + data);

            if (data.status) {
                logger.innerHTML += data.message + "<br>";
            } else logger.innerHTML += data.message + "<br>";
        }
    };
    var account = JSON.stringify({username: username, password: password});
    xhr.send(account);
}

function id(id) {
    return document.getElementById(id);
}
