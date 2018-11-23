package com.ig.chat.model;

public class Message {

    private String key, sender, recipient, message, time;
    
    public void setKey(String key) {
    	this.key = key;
    }
    
    public String getRecipient() {
    	return recipient;
    }

    public void setTime(String time) {
        this.time = time;
    }

    @Override
    public String toString() {
        return "Message: " + "\n\tusername='" + sender + '\'' + ",\n\trecipient='" + recipient + '\'' + ",\n\tmessage='" + message + '\'' + ",\n\ttime='" + time + '\'';
    }
}
