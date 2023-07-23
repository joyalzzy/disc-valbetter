import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosInstance,
  AxiosResponse,
} from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import { EntitlementResponse } from "valorant-api-types";
export namespace Handler {
  export type TokenResponse = {
    type: "response";
    response: {
      mode: string;
      parameters: {
        uri: string;
      };
    };
    country: string;
  };

  // type headers = {};
}
export class Handler {
  public headers: AxiosHeaders;

  public hversion: AxiosHeaders;
  protected ax: AxiosInstance;
  constructor() {
    this.headers = new AxiosHeaders();
    this.headers.set(
      
    );
    setInterval(async () => {await this.refreshToken()}, 3600000)
    this.ax = wrapper(
      axios.create({
        jar: new CookieJar(),
        baseURL: "",
        maxRedirects: 0,
        validateStatus: (status: number) => status >= 200 && status < 400,
      })
    );
    this.ax.interceptors.response.use(
      (res) => {
        console.log(`received ${res.status} ${res.config.url}`);

        return res;
      },
      (err: AxiosError) => {
        return Promise.reject(`received ${err.message} ${err.name} ${err.request._headers}`);
      }
    );
    this.ax.interceptors.request.use((req) => {
      console.log(`sent ${req.method} ${req.url}`);

      return req;
    });
  }
  async sendPostRequest(url: string, data: {}, headers?: AxiosHeaders) {
    return await this.ax.post(url, data, {
      headers:  this.headers ,
    });
  }
  async sendGetRequest(url: string, headers?: AxiosHeaders) {
    return await this.ax.get(url, {
      headers: this.headers.concat(headers),
    })
  }
  async sendPutRequest(url: string, data: {}, headers?: AxiosHeaders) {
    return await this.ax.put(url, data, {
      headers:  this.headers ,
    });
  }
  async setAuthedHeaders(user: string, pass: string) {
    this.ax.defaults.headers.common["User-Agent"]= `RiotClient/${(await axios.get('https://valorant-api.com/v1/version')).data.data.riotClientBuild} rso-auth (Windows; 10;;Professional, x64)`;
    await this.sendPostRequest(
      "https://auth.riotgames.com/api/v1/authorization",
      {
        client_id: "play-valorant-web-prod",
        nonce: "1",
        redirect_uri: "https://playvalorant.com/opt_in",
        response_type: "token id_token",
        scope: "account openid",
      }
    )
      .then((_) => {
        return this.sendPutRequest(
          "https://auth.riotgames.com/api/v1/authorization",
          {
            type: "auth",
            username: user,
            password: pass,
            rememberDevice: true,
          }
        );
      })
      .then((_: AxiosResponse<Handler.TokenResponse>) => {
        console.log(_)
        const searchURL = new URL(_.data.response.parameters.uri);
        const urlSearch = new URLSearchParams(searchURL.hash);
        this.headers.set(
          "Authorization",
          `Bearer ${urlSearch.get("#access_token")}`
        );
        console.log("expires in %d", urlSearch.get("expires_in"));

        return this.sendPostRequest(
          "https://entitlements.auth.riotgames.com/api/token/v1",
          {}
        );
      })
      .then((_: AxiosResponse<EntitlementResponse>) => {
        this.headers.set("X-Riot-Entitlements-JWT", _.data.entitlements_token);
        this.headers.set("X-Riot-API", process.env.RIOT_KEY);
      });
  }
  
  async refreshToken() {
    return this.headers.set(
      "Authorization",
      `Bearer ${new URLSearchParams(new URL(
        await this.sendGetRequest(
          "https://auth.riotgames.com/authorize?redirect_uri=https%3A%2F%2Fplayvalorant.com%2Fopt_in&client_id=play-valorant-web-prod&response_type=token%20id_token&nonce=1"
        ).then((_: AxiosResponse) => {
          return _.headers.location
        })
      ).hash).get("#access_token")}`
    ) 
  }
}

// export function catchValerror() {
// 
// }