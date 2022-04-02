import { InjectionKey } from 'vue';
import { AuthokVueClient } from './interfaces';

/**
 * @ignore
 */
export const AUTHOK_TOKEN = '$authok';

/**
 * Injection token used to `provide` the `AuthokVueClient` instance. Can be used to pass to `inject()`
 *
 * ```js
 * inject(AUTHOK_INJECTION_KEY)
 * ```
 */
export const AUTHOK_INJECTION_KEY: InjectionKey<AuthokVueClient> = Symbol(
  AUTHOK_TOKEN
);
