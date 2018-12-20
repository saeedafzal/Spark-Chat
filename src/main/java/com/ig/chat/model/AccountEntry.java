package com.ig.chat.model;

public class AccountEntry {

    private String username, password;

    public AccountEntry(String username, String password) {
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
        return "\nAccountEntry: " + "\n\tusername='" + username + '\'' + ", \n\tpassword='" + password + '\'' + "";
    }
}
