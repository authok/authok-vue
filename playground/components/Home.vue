<template>
  <p>
    <strong>Is authenticated:</strong>&nbsp;<span data-cy="authenticated">{{
      isAuthenticated
    }}</span>
  </p>

  <div v-if="!loading">
    <div class="btn-toolbar justify-content-between">
      <div class="btn-group mb-3">
        <button class="btn btn-info" @click="useAuthok" data-cy="use-authok">
          使用AuthOK
        </button>

        <button
          class="btn btn-info"
          @click="useNodeOidcProvider"
          data-cy="use-node-oidc-provider"
        >
          使用 Node OIDC Provider
        </button>
      </div>
      <div class="btn-group mb-3" v-if="!isAuthenticated">
        <button class="btn btn-primary" @click="loginPopup">Login popup</button>

        <button
          class="btn btn-primary"
          @click="loginRedirect"
          id="login_redirect"
        >
          Login redirect
        </button>
      </div>
      <div class="btn-group mb-3" v-if="isAuthenticated">
        <button class="btn btn-outline-primary" @click="logoutLocal">
          Logout (local only)
        </button>

        <button
          class="btn btn-outline-primary"
          @click="logout"
          id="logout"
          data-cy="logout"
        >
          Logout
        </button>
      </div>
    </div>

    <div
      v-for="current in scopesWithSuffix"
      v-if="isAuthenticated"
      v-bind:key="current.scope"
    >
      <div class="card mb-3 bg-light">
        <div class="card-header">
          <strong>{{ current.audience || 'default' }}</strong>
          <span
            v-for="s of current.scope.split(' ')"
            v-bind:key="s"
            class="badge badge-success ml-1"
            >{{ s }}</span
          >
        </div>
        <div class="card-body">
          <div class="form-group">
            <label for="scope">Scope</label>
            <input
              type="text"
              class="form-control"
              id="scope"
              v-model="current.scope"
              :data-cy="'scope' + current.suffix"
            />
          </div>

          <div class="btn-group mb-0">
            <button
              class="btn btn-outline-info"
              @click="
                getToken(current.audience, current.scope, current.access_tokens)
              "
              :data-cy="'get-token' + current.suffix"
            >
              Get access token
            </button>

            <button
              class="btn btn-outline-info"
              @click="
                getTokenPopup(
                  current.audience,
                  current.scope,
                  current.access_tokens
                )
              "
            >
              Get access token with a popup
            </button>
          </div>

          <div class="card mb-0 mt-3" v-if="current.access_tokens.length > 0">
            <div class="card-header">Access Tokens</div>
            <div class="card-body">
              <ul
                v-for="token in current.access_tokens"
                v-bind:key="token.__raw"
              >
                <li :data-cy="'access-token' + current.suffix">
                  {{ token.token }} (<a
                    :href="'https://jwt.io?token=' + token.__raw"
                    target="_blank"
                    >view</a
                  >)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template v-if="error">
      <hr />
      <h3>Last error</h3>
      <pre><code data-cy="error">
{{JSON.stringify(error, null, 2)}}
              </code>
          </pre>
    </template>

    <hr />

    <div class="card mb-3" v-if="profile">
      <div class="card-header">Profile</div>
      <div class="card-body">
        <pre>
              <code data-cy="profile">
{{ JSON.stringify(profile, null, 2) }}
              </code>
            </pre>
      </div>
    </div>

    <div class="card mb-3" v-if="id_token">
      <div class="card-header">ID Token</div>
      <div class="card-body">
        {{ id_token }} (<a
          :href="'https://jwt.io?token=' + id_token_raw"
          target="_blank"
          >view</a
        >)
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, computed } from 'vue';
import { useAuthok } from '../../src';

const obfuscateToken = function (value: string) {
  if (value && value.length > 35) {
    return value.substr(0, 16) + '…  …' + value.substr(-16, 16);
  }

  return value;
};

export default {
  name: 'home',
  components: {},
  props: {
    domain: {
      type: String,
      required: true
    },
    audience: {
      type: String,
      required: true
    },
    client_id: {
      type: String,
      required: true
    }
  },
  setup(props: any) {
    const authok = useAuthok();

    const audienceScopes = ref([
      {
        audience: props.audience,
        scope: 'openid profile email',
        access_tokens: [],
        suffix: ''
      },
      {
        audience:
          props.domain?.indexOf('http') > -1
            ? props.domain + '/api/v1/'
            : 'https://' + props.domain + '/api/v1/',
        scope: 'read:rules',
        access_tokens: [],
        suffix: ''
      }
    ]);

    const scopesWithSuffix = computed(() =>
      audienceScopes.value.map(function (scope, index) {
        scope.suffix = index > 0 ? '-' + index : '';
        return scope;
      })
    );

    return {
      loading: authok.isLoading,
      id_token_raw: computed(() => authok.idTokenClaims?.value?.__raw),
      id_token: computed(() =>
        obfuscateToken(authok.idTokenClaims?.value?.__raw)
      ),
      isAuthenticated: authok.isAuthenticated,
      profile: authok.user,

      scopesWithSuffix,
      error: authok.error,

      loginRedirect: function () {
        authok.loginWithRedirect({
          redirect_uri: window.location.origin
        });
      },

      loginPopup: async function () {
        await authok.loginWithPopup();
      },

      logout: function () {
        authok.logout({
          returnTo: window.location.origin
        });
      },

      logoutLocal: function () {
        authok.logout({
          returnTo: window.location.origin,
          localOnly: true
        });
      },

      getToken: function (
        audience: string,
        scope: string,
        access_tokens: any[]
      ) {
        authok
          .getAccessTokenSilently({
            audience: audience,
            scope: scope
          })
          .then(function (token: string) {
            access_tokens.push({
              token: obfuscateToken(token),
              __raw: token
            });
          });
      },
      getTokenPopup: function (
        audience: string,
        scope: string,
        access_tokens: any[]
      ) {
        authok
          .getAccessTokenWithPopup({ audience: audience, scope: scope })
          .then(function (token: string) {
            access_tokens.push({
              token: obfuscateToken(token),
              __raw: token
            });
          });
      },

      useAuthok: function () {
        localStorage.setItem(
          'vue-playground-data',
          JSON.stringify({
            domain: 'frdrkprck.eu.authok.com',
            client_id: 'IJ1pIAk1G4Fd5D0elgte3EifRwfIscVx',
            audience: 'Test',
            useFormData: false
          })
        );

        window.location.reload();
      },

      useNodeOidcProvider() {
        localStorage.setItem(
          'vue-playground-data',
          JSON.stringify({
            domain: 'http://127.0.0.1:3000',
            client_id: 'testing',
            audience: '',
            useFormData: true
          })
        );
        window.location.reload();
      }
    };
  }
};
</script>
