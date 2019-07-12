import auth0 from 'auth0-js';
import config from '../config';
import history from '../history';

const AUTH_ACCESS_TOKEN = 'auth_access_token';
const AUTH_ID_TOKEN = 'auth_id_token';
const AUTH_EXPIRES_AT = 'auth_expires_at';

const auth = new auth0.WebAuth({
  domain: config.auth0.domain,
  clientID: config.auth0.clientID,
  redirectUri: config.auth0.redirectUri,
  audience: config.auth0.audience,
  responseType: 'token id_token',
  scope: 'openid',
});

const setSession = (authResult) => {
  const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
  localStorage.setItem(AUTH_ACCESS_TOKEN, authResult.accessToken);
  localStorage.setItem(AUTH_ID_TOKEN, authResult.idToken);
  localStorage.setItem(AUTH_EXPIRES_AT, expiresAt);
};

export function requestLogin() {
  return (dispatch) => {
    auth.authorize();
    dispatch({ type: 'LOGIN_REQUESTED' });
  };
}

export function receiveLogin() {
  return (dispatch) => {
    auth.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        setSession(authResult);
        const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            accessToken: authResult.accessToken,
            idToken: authResult.idToken,
            expiresAt,
          },
        });
        // ReactGA.event({ category: 'Authentication', action: 'Login Success' });
        // setLoginExpiryTimeout(dispatch);
        history.replace('/');
      } else if (err) {
        history.replace('/');
        console.log(err);
      }
    });
  };
}