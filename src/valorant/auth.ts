import { InteractionResponseType, StringSelectMenuBuilder } from "discord.js";
import { stringify } from "querystring";
import axios, { AxiosInstance, AxiosResponse, AxiosResponseTransformer } from "axios";
import { validateHeaderName } from "http";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";
import { URLSearchParams } from "url";
import {
  authCookiesEndpoint,
  authRequestEndpoint,
  EntitlementResponse,
} from "valorant-api-types";
// import { test } from "node:test";

export namespace Auth {
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
  // export type AuthResponse = {
  //   ax: AxiosInstance;
  //   session_uri: string;
  //   entitlements_token: string;
  //   access_token: string;
  //   id_token: string;
  //   expires_in: number;
  //   token_type: string;
  //   session_state: string;
  // }
}
export class Auth {
  ax: AxiosInstance;
  session_uri: string;
  entitlements_token: string;
  access_token: string;
  id_token: string;
  expires_in: number;
  token_type: string;
  session_state: string;
  constructor() {
    this.ax = wrapper(
      axios.create({
        jar: new CookieJar(),
        baseURL: "",
        // withCredentials: true,
        headers: {
          //      "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
          //          "Content-Type": "application/json",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246",
        },
      })
    );
  }

  async auth(user: string, pass: string) {
    // get cookie
    await this.ax.post("https://auth.riotgames.com/api/v1/authorization", {
      "client_id": "play-valorant-web-prod",
      "nonce": "1",
      "redirect_uri": "https://playvalorant.com/opt_in",
      "response_type": "token id_token",
      "scope": "account openid"
    });
    // put auth
    await this.ax.put(
      "https://auth.riotgames.com/api/v1/authorization",
      {
        type: "auth",
        username: user,
        password: pass,
        rememberDevice: true,
      }
    ).then((res: AxiosResponse<Auth.TokenResponse>) => {
      this.session_uri = res.data.response.parameters.uri
    })
    // post auth
    const searchURL: URL = new URL(this.session_uri)
    const urlSearch = new URLSearchParams(searchURL.hash)

    this.access_token = String(urlSearch.get("#access_token"));
    this.id_token = urlSearch.get("id_token") || "";
    this.expires_in = Number(urlSearch.get("expires_in") || 0);
    this.token_type = urlSearch.get("token_type") || "";
    this.session_state = urlSearch.get("session_state") || "";

    await this.ax.post(
      "https://entitlements.auth.riotgames.com/api/token/v1", {},
      {
        headers: {
          Authorization: `Bearer ${this.access_token}`
        }
      }
    ).then((res: AxiosResponse<EntitlementResponse>) => {
      this.entitlements_token = res.data.entitlements_token
    },
    )
    // console.log(this.entitlements_token)
  }
}
