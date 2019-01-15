package com.hknight.chat.messaging;

import javax.websocket.DecodeException;
import javax.websocket.Decoder;
import javax.websocket.EndpointConfig;

import com.google.gson.Gson;

public class MessageDecoder implements Decoder.Text<Message> {

    private Gson gson = new Gson();
    
    @Override
    public Message decode(String message) throws DecodeException {
        return gson.fromJson(message, Message.class);
    }
    
    @Override
    public void init(EndpointConfig config) {
    }

    @Override
    public void destroy() {
    }

    @Override
    public boolean willDecode(String s) {
        return false;
    }
    
}
