import axios, { AxiosInstance, AxiosResponse } from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import { EntitlementResponse } from "valorant-api-types";
import { ValCache } from "./cache";
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
}
export class Handler {
  public headers: {};
  public hversion: {};
  protected ax: AxiosInstance;
  constructor() {
    this.headers = {
      //      "Access-Control-Allow-Origin": "*",
      // "Content-Type": "application/json",
      //          "Content-Type": "application/json",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246",
    };
    this.ax = wrapper(
      axios.create({
        jar: new CookieJar(),
        baseURL: "",
      })
    );
    this.ax.interceptors.response.use(
      (res) => {
        console.log(`${res.status} ${res.config.url}`);
        
        return res;
      },
      (err: Error) => {
        return Promise.reject(`${err.message} ${err.name}`);
      }
    );
    this.ax.interceptors.request.use((req) => {
      console.log(`sent ${req.url}`);

      return req;
    });
  }
  async sendPostRequest(url: string, data: {}, headers?: {}) {
    return await this.ax.post(url, data, {
      headers: { ...headers, ...this.headers },
    });
  }
  async sendGetRequest(url: string, headers?: {}) {
    return await this.ax.get(url, {
      headers: { ...headers, ...this.headers },
    });
  }
  async sendPutRequest(url: string, data: {}, headers?: {}) {
    return await this.ax.put(url, data, {
      headers: { ...headers, ...this.headers },
    });
  }
  async setAuthedHeaders(user: string, pass: string) {
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
        const searchURL = new URL(_.data.response.parameters.uri);
        const urlSearch = new URLSearchParams(searchURL.hash);
        this.headers = {
          ...this.headers,
          ...{
            Authorization: `Bearer ${urlSearch.get("#access_token")}`,
          },
        };

        return this.sendPostRequest(
          "https://entitlements.auth.riotgames.com/api/token/v1",
          {}
        );
      })
      .then((_: AxiosResponse<EntitlementResponse>) => {
        this.headers = {
          ...this.headers,
          ...{
            "X-Riot-Entitlements-JWT": _.data.entitlements_token,
            "X-Riot-Token": process.env.RIOT_KEY,
          },
        };
      });
  }
}
