package com.ig.chat;

import com.ig.chat.model.LoginException;
import org.junit.Before;
import org.junit.Test;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.CoreMatchers.is;

public class CreateAccountTest {

    private Login login;

    @Before
    public void test() {
        login = new Login();
    }

    @Test
    public void createNewAccountTest() throws LoginException {
        int numberOfUsers = login.getUserList().size();
        assertThat(login.getUserList().size(), is(numberOfUsers));

        login.createAccount("Saeed", "Pass");
        assertThat(login.getUserList().size(), is(numberOfUsers + 1));
    }

    @Test
    public void accountWithExistingName() {
        
    }

    @Test
    public void loggingInWithCreatedAccountTest() {

    }
}
