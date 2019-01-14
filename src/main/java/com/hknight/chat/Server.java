package com.hknight.chat;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static spark.Spark.staticFileLocation;
import static spark.Spark.webSocket;

public class Server {
    
    private static final Logger LOG = LoggerFactory.getLogger(Server.class);
    
    public static void main(String[] args) {
        LOG.info("----------------------------");
        staticFileLocation("/site");
        webSocket("/chat", Handler.class);
    }
}
