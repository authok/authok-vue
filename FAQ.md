# 常见问题

**Note:** `authok-vue` uses [Authok SPA JS](https://github.com/authok/authok-spa-js) behind the scenes, so be sure to check [their FAQs](https://github.com/authok/authok-spa-js/blob/master/FAQ.md) too.

- [常见问题](#常见问题)
  - [1. User is not logged in after page refresh](#1-user-is-not-logged-in-after-page-refresh)
  - [2. User is not logged in after successful sign in with redirect](#2-user-is-not-logged-in-after-successful-sign-in-with-redirect)
  - [3. User is redirected to `/` after successful sign in with redirect](#3-user-is-redirected-to--after-successful-sign-in-with-redirect)
  - [4. 在应用和 Authok 之间发生无限循环重定向](#4-在应用和-authok-之间发生无限循环重定向)

## 1. User is not logged in after page refresh

There are usually 3 reasons for this:

**1. The user logged in with a Social Provider (like Google) and you are using the Authok Developer Keys**

If you are using the [Classic Universal Login](https://authok.com/docs/universal-login/classic) experience, [Silent Authentication](https://authok.com/docs/authorization/configure-silent-authentication) won't work on the `/authorize` endpoint. This library uses Silent Authentication internally to check if a user is already signed in after page refresh, so that won't work either. You should either change to the [New Universal Login](https://authok.com/docs/universal-login/new-experience) experience or [add your own keys](https://authok.com/docs/connections/identity-providers-social) to that particular social connection.

**2. You are using a browser like Safari or Brave that has Intelligent Tracking Prevention turned on by default**

In this case Silent Authentication will not work because it relies on a hidden iframe being logged in to a different domain (usually `authok.com`) and browsers with ITP do not allow third-party (eg iframed) cookies. There are 2 workarounds for this using [Rotating Refresh Tokens](https://authok.com/docs/tokens/refresh-tokens/refresh-token-rotation) or [Custom Domains](https://authok.com/docs/custom-domains)

**3. You are using Multifactor Authentication**

In this case, when your users are not _remembering this device for 30 days_, Silent Authentication will not work because it can not get past the MFA step without the user's interaction. The consequence of it is that on both a page refresh as well as when trying to renew an expired Access Token, our SDK will throw a `Multifactor authentication required` error.

- On page load, catch this error and redirect the user to Authok by calling `loginWithRedirect`, prompting the user with MFA.
- Ensure you can renew access tokens without relying on Silent Authentication by using [Rotating Refresh Tokens](https://authok.com/docs/tokens/refresh-tokens/refresh-token-rotation).

Because our SDK persists tokens in memory by default, refreshing the page relies on Authok side to restore our session. If you combine [Rotating Refresh Tokens](https://authok.com/docs/tokens/refresh-tokens/refresh-token-rotation) with [localstorage](https://github.com/authok/authok-spa-js#user-content-data-caching-options), calling `loginWithRedirect` on page load should not be necessary.

```ts
import { createAuthOK } from '@authok/authok-vue';

const app = createApp(App);
app.use(
  createAuthOK({
    domain: '<AUTHOK_DOMAIN>',
    client_id: '<AUTHOK_CLIENT_ID>',
    redirect_uri: '<MY_CALLBACK_URL>',
    useRefreshTokens: true,
    cacheLocation: 'localstorage'
  })
);
app.mount('#app');
```

**Important**: This feature will allow the caching of data such as ID and access tokens to be stored in local storage. Exercising this option changes the security characteristics of your application and should not be used lightly. Extra care should be taken to mitigate against XSS attacks and minimize the risk of tokens being stolen from local storage.

## 2. User is not logged in after successful sign in with redirect

If after successfully logging in, your user returns to your SPA and is still not authenticated, do _not_ refresh the page - go to the Network tab on Chrome and confirm that the POST to `oauth/token` resulted in an error `401 Unauthorized`. If this is the case, your tenant is most likely misconfigured. Go to your **Application Properties** in your application's settings in the [Authok Dashboard](https://manage.authok.com) and make sure that `Application Type` is set to `Single Page Application` and `Token Endpoint Authentication Method` is set to `None` (**Note:** there is a known issue with the Authok "默认 App", if you are unable to set `Token Endpoint Authentication Method` to `None`, create a new Application of type `Single Page Application` or see the advice in [authok-react/issues/93](https://github.com/authok/authok-react/issues/93#issuecomment-673431605))

## 3. User is redirected to `/` after successful sign in with redirect

By default, the SDK is configured to redirect the user back to the root of the application after succesfully exchanging the `code` for the corresponding token(s).

This is what a typical default flow looks like:

- `createAuthOK` is configured with a specific redirectUrl (e.g. `http://localhost:4200/callback`).
- User initiates login by calling `loginWithRedirect()`
- User is redirected to Authok, including a `redirectUri` (in this case `http://localhost:4200/callback`)
- After succesful authentication, the user is redirected back to the provided redirectUri, including a `code` and `state` query parameter (in this case `http://localhost:4200/callback?code={code}&state={state}`)
- The configured `redirectUri` is only used to process `code` and `state` in order to retrieve an actual token.
- The user is then redirected to `/`

However, if the user should not be redirected back to `/` in the very last step, but instead they should end up at a different URL, this can be configured by providing that information to `loginWithRedirect()`:

```html
<script>
  import { useAuthok } from '@authok/authok-vue';

  export default {
    setup() {
      const { loginWithRedirect } = useAuthok();

      return {
        login: () => {
          loginWithRedirect({
            appState: { target: '/some-url' }
          });
        }
      };
    }
  };
</script>
```

By doing that, in the very last step the SDK will not redirect the user back to `/`, but to `/some-url` instead.

**Restoring querystring parameters**

The same approach can be used in order to restore application specific querystring parameters that need to be restored after being redirected back to your application.

```ts
loginWithRedirect({
  appState: { target: '/some-url?query=value' }
});
```

## 4. 在应用和 Authok 之间发生无限循环重定向

通常是 `redirectUri` 指向了一个 _被保护_ 路由.

`redirectUri` 应该指向一个应用的 **公开** 路由(even if the entire application is secure, our SDK needs a public route to be redirected back to). This is because, when redirecting back to the application, there is no user information available yet. The SDK first needs to process the URL (`code` and `state` query parameters) and call Authok's endpoints to exchange the code for a token. Once that is successful, the user is considered authenticated.
