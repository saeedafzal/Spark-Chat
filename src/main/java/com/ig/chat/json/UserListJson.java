package com.ig.chat.json;

import com.ig.chat.model.Account;

import java.util.List;

public class UserListJson {
    private String key;
    private List<Account> list;

    public UserListJson(String key, List<Account> list) {
        this.key = key;
        this.list = list;
    }
}
