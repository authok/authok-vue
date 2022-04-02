import { App, ref } from 'vue';
import { AuthOKVueClient, authGuard, createAuthGuard } from '../src/index';
import { AUTHOK_TOKEN } from '../src/token';
import { client } from './../src/plugin';

let watchEffectMock;

jest.mock('vue', () => {
  return {
    ...(jest.requireActual('vue') as any),
    watchEffect: function (cb) {
      watchEffectMock = cb;
      return () => {};
    }
  };
});

jest.mock('./../src/plugin', () => {
  return {
    ...(jest.requireActual('./../src/plugin') as any),
    client: ref({
      loginWithRedirect: jest.fn().mockResolvedValue({}),
      isAuthenticated: ref(false),
      isLoading: ref(false)
    })
  };
});

describe('createAuthGuard', () => {
  let appMock: App<any>;
  let authOKMock: Partial<AuthOKVueClient> = {
    loginWithRedirect: jest.fn().mockResolvedValue({}),
    isAuthenticated: ref(false),
    isLoading: ref(false)
  };

  beforeEach(() => {
    authOKMock.isAuthenticated.value = false;
    authOKMock.isLoading.value = false;
    appMock = ({
      config: {
        globalProperties: {
          [AUTHOK_TOKEN]: authOKMock
        }
      }
    } as any) as App<any>;
  });

  it('should create the guard', async () => {
    const guard = createAuthGuard(appMock);
    expect(guard).toBeDefined();
    expect(typeof guard).toBe('function');
  });

  it('should wait untill isLoading is false', async () => {
    const guard = createAuthGuard(appMock);

    authOKMock.isLoading.value = true;

    expect.assertions(4);

    guard({
      fullPath: 'abc'
    } as any).then(() => {
      expect(true).toBeTruthy();
    });

    expect(authOKMock.loginWithRedirect).not.toHaveBeenCalled();

    authOKMock.isLoading.value = false;

    expect(authOKMock.loginWithRedirect).not.toHaveBeenCalled();

    await watchEffectMock();

    expect(authOKMock.loginWithRedirect).toHaveBeenCalled();
  });

  it('should return true when authenticated', async () => {
    const guard = createAuthGuard(appMock);

    authOKMock.isAuthenticated.value = true;

    expect.assertions(2);

    const result = await guard({
      fullPath: 'abc'
    } as any);

    expect(result).toBe(true);
    expect(authOKMock.loginWithRedirect).not.toHaveBeenCalled();
  });

  it('should call loginWithRedirect', async () => {
    const guard = createAuthGuard(appMock);

    expect.assertions(1);

    await guard({
      fullPath: 'abc'
    } as any);

    expect(authOKMock.loginWithRedirect).toHaveBeenCalledWith(
      expect.objectContaining({
        appState: { target: 'abc' }
      })
    );
  });
});
describe('authGuard', () => {
  let authOKMock;

  beforeEach(() => {
    client.value.isAuthenticated = false as any;
    client.value.isLoading = false as any;
    authOKMock = client.value;
  });

  it('should wait untill isLoading is false', async () => {
    const guard = authGuard;

    authOKMock.isLoading = true;

    expect.assertions(4);

    guard({
      fullPath: 'abc'
    } as any).then(() => {
      expect(true).toBeTruthy();
    });

    expect(authOKMock.loginWithRedirect).not.toHaveBeenCalled();

    authOKMock.isLoading = false;

    expect(authOKMock.loginWithRedirect).not.toHaveBeenCalled();

    await watchEffectMock();

    expect(authOKMock.loginWithRedirect).toHaveBeenCalled();
  });

  it('should return true when authenticated', async () => {
    const guard = authGuard;

    authOKMock.isAuthenticated = true;

    expect.assertions(2);

    const result = await guard({
      fullPath: 'abc'
    } as any);

    expect(result).toBe(true);
    expect(authOKMock.loginWithRedirect).not.toHaveBeenCalled();
  });

  it('should call loginWithRedirect', async () => {
    const guard = authGuard;

    expect.assertions(1);

    await guard({
      fullPath: 'abc'
    } as any);

    expect(authOKMock.loginWithRedirect).toHaveBeenCalledWith(
      expect.objectContaining({
        appState: { target: 'abc' }
      })
    );
  });
});
