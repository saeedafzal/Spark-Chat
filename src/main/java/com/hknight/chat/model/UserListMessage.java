package com.hknight.chat.model;

import java.util.Set;

public class UserListMessage {

    private MessageTypes messageType;
    private Set<String> userlist;
    
    public UserListMessage(MessageTypes messageType, Set<String> userlist) {
        this.messageType = messageType;
        this.userlist = userlist;
    }
}
