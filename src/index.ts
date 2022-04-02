import { inject } from 'vue';
import { Router } from 'vue-router';
import './global';
import {
  AuthokVueClient,
  AuthokPlugin,
  AuthokPluginOptions,
  AuthokVueClientOptions
} from './global';
import { AUTHOK_INJECTION_KEY, AUTHOK_TOKEN } from './token';

export * from './global';
export { AUTHOK_INJECTION_KEY } from './token';

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    [AUTHOK_TOKEN]: AuthokVueClient;
  }
}

/**
 * Creates the Authok plugin.
 *
 * @param clientOptions The Auth Vue Client Options
 * @param pluginOptions Additional Plugin Configuration Options
 * @returns An instance of AuthokPlugin
 */
export function createAuthok(
  clientOptions: AuthokVueClientOptions,
  pluginOptions?: AuthokPluginOptions
) {
  return new AuthokPlugin(clientOptions, pluginOptions);
}

/**
 * Returns the registered Authok instance using Vue's `inject`.
 * @returns An instance of AuthokVueClient
 */
export function useAuthok(): AuthokVueClient {
  return inject(AUTHOK_INJECTION_KEY);
}
