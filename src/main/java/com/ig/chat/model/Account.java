package com.ig.chat.model;

public class Account {

    private String username, password;

    public Account(String username, String password) {
        this.username = username;
        this.password = password;
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    @Override
    public String toString() {
        return "\nAccount: " + "\n\tusername='" + username + '\'' + ", \n\tpassword='" + password + '\'';
    }
}
