import { RouteLocation } from 'vue-router';
import { watchEffectOnceAsync } from './utils';
import { client as authokClient } from './plugin';
import { AUTHOK_TOKEN } from './token';
import { AuthokVueClient } from './interfaces';
import { App, unref } from 'vue';

async function createGuardHandler(client: AuthokVueClient, to: RouteLocation) {
  const fn = async () => {
    if (unref(client.isAuthenticated)) {
      return true;
    }

    await client.loginWithRedirect({
      appState: { target: to.fullPath }
    });

    return false;
  };

  if (!unref(client.isLoading)) {
    return fn();
  }

  await watchEffectOnceAsync(() => !unref(client.isLoading));

  return fn();
}

export function createAuthGuard(app: App) {
  return async (to: RouteLocation) => {
    const authok = app.config.globalProperties[AUTHOK_TOKEN] as AuthokVueClient;

    return createGuardHandler(authok, to);
  };
}

export async function authGuard(to: RouteLocation) {
  const authok = unref(authokClient);

  return createGuardHandler(authok, to);
}
