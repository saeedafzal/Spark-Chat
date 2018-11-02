package com.ig.chat.model;

public class Response {

    private boolean key;
    private String message;

    public Response(boolean key, String message) {
        this.key = key;
        this.message = message;
    }

    @Override
    public String toString() {
        return "Response:" + "\n\tkey=" + key + ", \n\tmessage='" + message + '\'';
    }
}
