package com.hknight.chat.messaging;

import java.util.Date;

public class Message {

    private String content;
    private String sender, recipient;
    private Date received;

    public void setContent(String content) {
        this.content = content;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public Date getReceived() {
        return received;
    }

    public void setReceived(Date received) {
        this.received = received;
    }
}
