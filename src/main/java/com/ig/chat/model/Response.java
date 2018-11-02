package com.ig.chat.model;

public class Response {

    private boolean key;
    private String message;

    public Response(boolean key, String message) {
        this.key = key;
        this.message = message;
    }

    public void setKey(boolean key) {
        this.key = key;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    @Override
    public String toString() {
        return "Response{" +
                "\nkey=" + key +
                ", \nmessage='" + message + '\'' +
                '}';
    }
}
