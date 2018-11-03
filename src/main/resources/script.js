var username;
var logger = id("logger");
id("create_screen").style.display = "none";

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

function createAccount() {
	var username_create = id("username_create").value;
	var password_create = id("password_create").value;
	var conf_pass_create = id("conf_pass_create").value;
	
	if (username_create === "" || password_create === "" || conf_pass_create === "") {
		logger.innerHTML += "Enter all fields.<br>";
        return;
	}
	if (password_create !== conf_pass_create) {
		logger.innerHTML += "Passwords do not match.<br>";
		return;
	}
	
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "http://localhost:4567/create");
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.onreadystatechange = function () {
		if (xhr.readyState === 4 && xhr.status === 200) {
			var data = JSON.parse(xhr.responseText);
			console.log("Received data.");
			
			if (data.status) {
				logger.innerHTML += data.message + "<br>";
			} else logger.innerHTML += data.message + "<br>";
		}
	};
	var account = JSON.stringify({username: username_create, password: password_create});
	xhr.send(account);
}

function displayCreateAccount() {
	id("login_screen").style.display = "none";
	id("create_screen").style.display = "block";
}

function id(id) {
    return document.getElementById(id);
}
