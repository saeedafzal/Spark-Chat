package com.ig.chat;

import com.ig.chat.model.Message;
import org.eclipse.jetty.websocket.api.Session;
import org.junit.Before;
import org.junit.Test;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.CoreMatchers.nullValue;
import static org.hamcrest.MatcherAssert.assertThat;

public class RecieverSessionTest {

    private Handler handler;

    @Before
    public void setup() {
        handler = new Handler();
    }

    @Test
    public void getCorrectSession() {
        Message message = new Message();
        message.setReceiver("Bob");

        Session session = handler.getReceiverSession(message);

        assertThat(session, is(session));
    }

    @Test
    public void returnNullForIncorrectSession() {
        Message message = new Message();

        Session session = handler.getReceiverSession(message);

        assertThat(session, is(nullValue()));
    }
}
