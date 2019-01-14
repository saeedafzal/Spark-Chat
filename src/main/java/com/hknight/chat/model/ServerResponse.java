package com.hknight.chat.model;

public class ServerResponse {

    private MessageTypes messageType;
    private boolean status;
    private String message;
    
    public ServerResponse(MessageTypes messageType, boolean status, String message) {
        this.messageType = messageType;
        this.status = status;
        this.message = message;
    }

    public boolean getStatus() {
        return status;
    }

    @Override
    public String toString() {
        return "ServerResponse [messageType=" + messageType + ", status=" + status + ", message=" + message + "]";
    }
}
