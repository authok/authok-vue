import { App, Ref, ref } from 'vue';
import { Router } from 'vue-router';
import { createAuthokClientProxy } from './client.proxy';
import {
  AuthokPluginOptions,
  AuthokVueClient,
  AuthokVueClientOptions
} from './interfaces';
import { AUTHOK_INJECTION_KEY, AUTHOK_TOKEN } from './token';
import version from './version';

/**
 * @ignore
 */
export const client: Ref<AuthokVueClient> = ref(null);

/**
 * @ignore
 */
export class AuthokPlugin {
  constructor(
    private clientOptions: AuthokVueClientOptions,
    private pluginOptions?: AuthokPluginOptions
  ) {}

  install(app: App) {
    const proxy = createAuthokClientProxy({
      ...this.clientOptions,
      authokClient: {
        name: 'authok-vue',
        version: version
      }
    });

    this.__checkSession(proxy, app.config.globalProperties.$router);

    app.config.globalProperties[AUTHOK_TOKEN] = proxy;
    app.provide(AUTHOK_INJECTION_KEY, proxy);

    client.value = proxy;
  }

  private async __checkSession(proxy: AuthokVueClient, router?: Router) {
    const search = window.location.search;

    if (
      (search.includes('code=') || search.includes('error=')) &&
      search.includes('state=') &&
      !this.pluginOptions?.skipRedirectCallback
    ) {
      const result = await proxy.handleRedirectCallback();
      const appState = result?.appState;
      const target = appState?.target ?? '/';

      window.history.replaceState({}, '', '/');

      if (router) {
        router.push(target);
      }

      return result;
    } else {
      await proxy.checkSession();
    }
  }
}
