package com.hknight.chat;

import static org.junit.Assert.assertThat;
import static org.hamcrest.CoreMatchers.is;

import org.eclipse.jetty.websocket.api.Session;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mockito;

import com.hknight.chat.model.ServerResponse;
import com.hknight.chat.model.login.LoginHandler;
import com.hknight.chat.model.login.LoginRequest;

public class LoginRequestTest {

    private LoginHandler handler;

    @Before
    public void setup() {
        handler = new LoginHandler();
    }

    @Test
    public void loginTest() {
        final Session session = Mockito.mock(Session.class);

        final LoginRequest request = new LoginRequest();
        request.setUsername("Demo");
        request.setPassword("demo");

        ServerResponse response = handler.login(request, session);

        assertThat(response.getStatus(), is(true));
    }
}
