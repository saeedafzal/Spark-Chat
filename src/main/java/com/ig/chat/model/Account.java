package com.ig.chat.model;

public class Account {

    private String username, password;
    private Status status;

    public Account(String username, String password) {
        this.username = username;
        this.password = password;
        status = Status.OFFLINE;
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    @Override
    public String toString() {
        return "\nAccount: " + "\n\tusername='" + username + '\'' + ", \n\tpassword='" + password + '\'' + "";
    }
}
