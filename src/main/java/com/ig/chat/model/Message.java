package com.ig.chat.model;

public class Message {

    private String sender, recipient, message;

    @Override
    public String toString() {
        return "Message: " + "\n\tusername='" + sender + '\'' + ",\n\trecipient='" + recipient + '\'' + ",\n\tmessage='" + message + '\'';
    }
}
