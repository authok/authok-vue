/**
 * @ignore
 */
export interface AppState {
  /**
   * Target path the app gets routed to after
   * handling the callback from Authok (defaults to '/')
   */
  target?: string;

  /**
   * Any custom parameter to be stored in appState
   */
  [key: string]: any;
}
