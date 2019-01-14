package com.hknight.chat;

import static spark.Spark.init;
import static spark.Spark.staticFileLocation;
import static spark.Spark.webSocket;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Server {
    
    private static final Logger LOG = LoggerFactory.getLogger(Server.class);

    public static void main(String[] args) {
        LOG.info("Starting Spark server...");
        staticFileLocation("/site");
        webSocket("/chat", Handler.class);
        init();
        LOG.info("Server started.");
    }
}
