package com.ig.chat.json;

import com.ig.chat.model.Message;

public class MessageJson {
    private String key;
    private Message msg;
    private String sender, receiver, time;

    public MessageJson(String key, Message msg, String sender, String receiver, String time) {
        this.key = key;
        this.msg = msg;
        this.sender = sender;
        this.receiver = receiver;
        this.time = time;
    }
}
