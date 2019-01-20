package com.ig.chat.model;

import java.util.List;

public class UserListJson {

    private String key;
    private List<Account> value;

    public UserListJson(String key, List<Account> value) {
        this.key = key;
        this.value = value;
    }

    @Override
    public String toString() {
        return "UserListJson{" +
                "key='" + key + '\'' +
                ", value=" + value +
                '}';
    }
}
