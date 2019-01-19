var websocket;
var loggingOut;

function init() {
    connect();
}

function connect() {
    var websocketString;
    if (location.hostname == "localhost") websocketString = "ws://";
    else websocketString = "wss://";
    
    websocket = new WebSocket(websocketString + location.host + location.pathname + "chat");
    
    websocket.onopen = function() {
        console.log("Websocket connection established.");
        setupHeartbeat();
    }
    
    websocket.onmessage = function(msg) {
        console.log("Received message: " + msg.data);
    }
    
    websocket.onclose = function() {
        if (!loggingOut) {
            // Possible timeout
            console.log("Reconnecting...");
            connect();
        }
        
        console.log("Websocket closed.");
    }
}

// Helper functions
function id(id) {
    return document.getElementById(id);
}

window.onbeforeunload = function() {
    loggingOut = true;
    websocket.close();
}

function setupHeartbeat() {
    websocket.send("Ping");
}
