# @authok/authok-vue

Authok SDK for Vue 3 Applications using [Authorization Code Grant Flow with PKCE](https://authok.com/docs/api-auth/tutorials/authorization-code-grant-pkce).

> ⚠️ For integrating Authok with a Vue 2 application, please read [the Vue 2 Tutorial](https://github.com/authok/authok-vue/blob/main/tutorial/vue2-login.md).

![Stage: Stable Release](https://img.shields.io/badge/stage-stable-green)
[![CircleCI](https://img.shields.io/circleci/build/github/authok/authok-vue)](https://circleci.com/gh/authok/authok-vue)
[![codecov](https://codecov.io/gh/authok/authok-vue/branch/main/graph/badge.svg)](https://codecov.io/gh/authok/authok-vue)
[![License](https://img.shields.io/:license-mit-blue.svg?style=flat)](https://opensource.org/licenses/MIT)

## 内容

- [@authok/authok-vue](#authokauthok-vue)
  - [内容](#内容)
  - [文档](#文档)
  - [安装](#安装)
  - [快速开始](#快速开始)
    - [Authok 配置](#authok-配置)
    - [Configuring the plugin](#configuring-the-plugin)
    - [Add login to your application](#add-login-to-your-application)
    - [Display the user profile](#display-the-user-profile)
    - [Add logout to your application](#add-logout-to-your-application)
    - [Calling an API](#calling-an-api)
    - [Accessing ID Token claims](#accessing-id-token-claims)
    - [Error Handling](#error-handling)
    - [Protect a route](#protect-a-route)
  - [Contributing](#contributing)
  - [Support + Feedback](#support--feedback)
  - [Frequently Asked Questions](#frequently-asked-questions)
  - [Vulnerability Reporting](#vulnerability-reporting)
  - [Authok 是什么](#authok-是什么)
  - [许可](#许可)

## 文档

- [API reference](https://authok.github.io/authok-vue)
- [Quickstart Guide](https://authok.com/docs/quickstart/spa/vuejs)

## 安装

使用 [npm](https://npmjs.org):

```sh
npm install @authok/authok-vue
```

使用 [yarn](https://yarnpkg.com):

```sh
yarn add @authok/authok-vue
```

## 快速开始

- [@authok/authok-vue](#authokauthok-vue)
  - [内容](#内容)
  - [文档](#文档)
  - [安装](#安装)
  - [快速开始](#快速开始)
    - [Authok 配置](#authok-配置)
    - [Configuring the plugin](#configuring-the-plugin)
    - [Add login to your application](#add-login-to-your-application)
    - [Display the user profile](#display-the-user-profile)
    - [Add logout to your application](#add-logout-to-your-application)
    - [Calling an API](#calling-an-api)
    - [Accessing ID Token claims](#accessing-id-token-claims)
    - [Error Handling](#error-handling)
    - [Protect a route](#protect-a-route)
  - [Contributing](#contributing)
  - [Support + Feedback](#support--feedback)
  - [Frequently Asked Questions](#frequently-asked-questions)
  - [Vulnerability Reporting](#vulnerability-reporting)
  - [Authok 是什么](#authok-是什么)
  - [许可](#许可)

### Authok 配置

在 [Authok 管理后台](https://mgmt.authok.cn/app_mgmt/applications) 创建一个 **单页面应用(SPA)**.

> **If you're using an existing application**, verify that you have configured the following settings in your Single Page Application:
>
> - Click on the "Settings" tab of your application's page.
> - Ensure that "Token Endpoint Authentication Method" under "Application Properties" is set to "None"
> - Scroll down and click on the "Show Advanced Settings" link.
> - Under "Advanced Settings", click on the "OAuth" tab.
> - Ensure that "JsonWebToken Signature Algorithm" is set to `RS256` and that "OIDC Conformant" is enabled.

Next, configure the following URLs for your application under the "Application URIs" section of the "Settings" page:

- **Allowed Callback URLs**: `http://localhost:3000`
- **Allowed Logout URLs**: `http://localhost:3000`
- **Allowed Web Origins**: `http://localhost:3000`

> These URLs should reflect the origins that your application is running on. **Allowed Callback URLs** may also include a path, depending on where you're handling the callback (see below).

Take note of the **Client ID** and **Domain** values under the "Basic Information" section. You'll need these values in the next step.

### Configuring the plugin

Create an instance of the `AuthOKPlugin` by calling `createAuthOK` and pass it to Vue's `app.use()`.

```js
import { createAuthOK } from '@authok/authok-vue';

const app = createApp(App);

app.use(
  createAuthOK({
    domain: '<AUTHOK_DOMAIN>',
    client_id: '<AUTHOK_CLIENT_ID>',
    redirect_uri: '<MY_CALLBACK_URL>'
  })
);

app.mount('#app');
```

### Add login to your application

In order to add login to your application you can use the `loginWithRedirect` function that is exposed on the return value of `useAuthok`, which you can access in your component's `setup` function.

```html
<script>
  import { useAuthok } from '@authok/authok-vue';

  export default {
    setup() {
      const { loginWithRedirect } = useAuthok();

      return {
        login: () => {
          loginWithRedirect();
        }
      };
    }
  };
</script>
```

Once setup returns the correct method, you can call that method from your component's HTML.

```html
<template>
  <div>
    <button @click="login">Log in</button>
  </div>
</template>
```

<details>
  <summary>Using Options API</summary>

```html
<template>
  <div>
    <button @click="login">Log in</button>
  </div>
</template>

<script>
  export default {
    methods: {
      login() {
        this.$authok.loginWithRedirect();
      }
    }
  };
</script>
```

</details>

### Display the user profile

To display the user's information, you can use the reactive `user` property exposed by the return value of `useAuthok`, which you can access in your component's `setup` function.

```html
<script>
  import { useAuthok } from '@authok/authok-vue';

  export default {
    setup() {
      const { loginWithRedirect, user } = useAuthok();

      return {
        login: () => {
          loginWithRedirect();
        },
        user
      };
    }
  };
</script>
```

Once setup returns the SDK's reactive property, you can access that property from your component's HTML.

```html
<template>
  <div>
    <h2>User Profile</h2>
    <button @click="login">Log in</button>
    <pre>
        <code>{{ user }}</code>
      </pre>
  </div>
</template>
```

Note: Ensure the user is authenticated by implementing [login in your application](#add-login-to-your-application) before accessing the user's profile.

<details>
  <summary>Using Options API</summary>

```html
<template>
  <div>
    <h2>User Profile</h2>
    <button @click="login">Log in</button>
    <pre>
      <code>{{ user }}</code>
    </pre>
  </div>
</template>

<script>
  export default {
    data: function () {
      return {
        user: this.$authok.user
      };
    },
    methods: {
      login() {
        this.$authok.loginWithRedirect();
      }
    }
  };
</script>
```

</details>

### Add logout to your application

Adding logout to your application you be done by using the `logout` function that is exposed on the return value of `useAuthok`, which you can access in your component's `setup` function.

```html
<script>
  import { useAuthok } from '@authok/authok-vue';

  export default {
    setup() {
      const { logout } = useAuthok();

      return {
        logout: () => {
          logout({ returnTo: window.location.origin });
        }
      };
    }
  };
</script>
```

Once setup returns the correct method, you can call that method from your component's HTML.

```html
<template>
  <div>
    <button @click="logout">Log out</button>
  </div>
</template>
```

<details>
  <summary>Using Options API</summary>

```html
<template>
  <div>
    <button @click="logout">Log out</button>
  </div>
</template>

<script>
  export default {
    methods: {
      logout() {
        this.$authok.logout({ returnTo: window.location.origin });
      }
    }
  };
</script>
```

</details>

### Calling an API

To call an API, configure the plugin by setting the `audience` to the API Identifier of the API in question:

```js
import { createAuthOK } from '@authok/authok-vue';

const app = createApp(App);

app.use(
  createAuthOK({
    domain: '<AUTHOK_DOMAIN>',
    client_id: '<AUTHOK_CLIENT_ID>',
    redirect_uri: '<MY_CALLBACK_URL>',
    audience: '<AUTHOK_AUDIENCE>'
  })
);

app.mount('#app');
```

After configuring the plugin, you will need to retrieve an Access Token and set it on the `Authorization` header of your request.

Retrieving an Access Token can be done by using the `getAccessTokenSilently` function that is exposed on the return value of `useAuthok`, which you can access in your component's `setup` function.

```html
<script>
  import { useAuthok } from '@authok/authok-vue';

  export default {
    setup() {
      const { getAccessTokenSilently } = useAuthok();

      return {
        doSomethingWithToken: async () => {
          const token = await getAccessTokenSilently();
          const response = await fetch('https://api.example.com/posts', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          const data = await response.json();
        }
      };
    }
  };
</script>
```

<details>
  <summary>Using Options API</summary>

```html
<script>
  export default {
    methods: {
      async doSomethingWithToken() {
        const token = await this.$authok.getAccessTokenSilently();
        const response = await fetch('https://api.example.com/posts', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();
      }
    }
  };
</script>
```

</details>

### Accessing ID Token claims

To get access to the user's claims, you can use the reactive `idTokenClaims` property exposed by the return value of `useAuthok`, which you can access in your component's `setup` function.

```html
<script>
  import { useAuthok } from '@authok/authok-vue';

  export default {
    setup() {
      const { loginWithRedirect, idTokenClaims } = useAuthok();

      return {
        login: () => {
          loginWithRedirect();
        },
        idTokenClaims
      };
    }
  };
</script>
```

Once setup returns the SDK's reactive property, you can access that property from your component's HTML.

```html
<template>
  <div>
    <h2>ID Token Claims</h2>
    <button @click="login">Log in</button>
    <pre>
      <code>{{ idTokenClaims }}</code>
    </pre>
  </div>
</template>
```

<details>
  <summary>Using Options API</summary>

```html
<template>
  <div>
    <h2>ID Token Claims</h2>
    <button @click="login">Log in</button>
    <pre>
      <code>{{ idTokenClaims }}</code>
    </pre>
  </div>
</template>
<script>
  export default {
    data: function () {
      return {
        idTokenClaims: this.$authok.idTokenClaims
      };
    },
    methods: {
      login() {
        this.$authok.loginWithRedirect();
      }
    }
  };
</script>
```

</details>

### Error Handling

When using this SDK, it could be the case that it is unable to correctly handle the authentication flow for a variety of reasons (e.g. an expired session with Authok when trying to get a token silently). In these situations, calling the actual methods will result in an exception being thrown (e.g. `login_required`). On top of that, these errors are made available through the SDK's reactive `error` property:

```html
<script>
  import { useAuthok } from '@authok/authok-vue';

  export default {
    setup() {
      const { error } = useAuthok();

      return {
        error
      };
    }
  };
</script>
```

Once setup returns the SDK's `error` property, you can access that property from your component's HTML.

```html
<template>
  <div>
    <h2>Error Handling</h2>
    <pre>
      <code>{{ error?.error }}</code>
    </pre>
  </div>
</template>
```

<details>
  <summary>Using Options API</summary>

```html
<template>
  <div>
    <h2>Error Handling</h2>
    <pre>
      <code>{{ error?.error }}</code>
    </pre>
  </div>
</template>
<script>
  export default {
    data: function () {
      return {
        error: this.$authok.error
      };
    }
  };
</script>
```

</details>

### Protect a route

If you are using our authok-Vue SDK with [Vue-Router](https://next.router.vuejs.org/), you can protect a route by using the [Navigation Guard](https://next.router.vuejs.org/guide/advanced/navigation-guards.html) provided by the SDK.

> ⚠️ **注意**: the order in which the Router and Authok Vue plugin are registered is important. You must register the Router before the Authok SDK or you might see unexpected behavior.

```ts
import { createApp } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import { createAuthOK, authGuard } from '@authok/authok-vue';

const app = createApp(App);
app.use(createRouter({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile,
      beforeEnter: authGuard
    }
  ],
  history: createWebHashHistory()
}));
app.use(createAuthOK({ ... }));
app.mount('#app');
```

Applying the guard to a route, as shown above, will only allow access to authenticated users. When a non-authenticated user tries to access a protected route, the SDK will redirect the user to Authok and redirect them back to your application's `redirect_uri` (which is configured in `createAuthOK`, see [Configuring the plugin](#configuring-the-plugin)). Once the SDK is done processing the response from Authok and exchanging it for tokens, the SDK will redirect the user back to the protected route they were trying to access initially.

> ⚠️ If you are using multiple Vue applications with our SDK on a single page, using the above guard does not support a situation where the Authok Domain and ClientID would be different. In that case, read [our guide on protecting a route when using multiple Vue applications](https://github.com/authok/authok-vue/blob/main/EXAMPLES.md#1-protecting-a-route-when-using-multiple-vue-applications).

## Contributing

We appreciate feedback and contribution to this repo! Before you get started, please see the following:

- [Authok's general contribution guidelines](https://github.com/authok/open-source-template/blob/master/GENERAL-CONTRIBUTING.md)
- [Authok's code of conduct guidelines](https://github.com/authok/open-source-template/blob/master/CODE-OF-CONDUCT.md)
- [This repo's contribution guide](https://github.com/authok/authok-vue/blob/main/CONTRIBUTING.md)

## Support + Feedback

For support or to provide feedback, please [raise an issue on our issue tracker](https://github.com/authok/authok-vue/issues).

## Frequently Asked Questions

For a rundown of common issues you might encounter when using the SDK, please check out [the FAQ](https://github.com/authok/authok-vue/blob/main/FAQ.md).

## Vulnerability Reporting

Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://authok.com/whitehat) details the procedure for disclosing security issues.

## Authok 是什么

Authok helps you to easily:

- implement authentication with multiple identity providers, including social (e.g., Google, Facebook, Microsoft, LinkedIn, GitHub, Twitter, etc), or enterprise (e.g., Windows Azure AD, Google Apps, Active Directory, ADFS, SAML, etc.)
- log in users with username/password databases, passwordless, or multi-factor authentication
- link multiple user accounts together
- generate signed JSON Web Tokens to authorize your API calls and flow the user identity securely
- access demographics and analytics detailing how, when, and where users are logging in
- enrich user profiles from other data sources using customizable JavaScript rules

[为什么使用 Authok?](https://docs.authok.cn/docs/why-authok)

## 许可

This project is licensed under the MIT license. See the [LICENSE](https://github.com/authok/authok-vue/blob/main/LICENSE) file for more info.
