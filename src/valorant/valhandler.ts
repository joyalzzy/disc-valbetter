import axios, { AxiosInstance, AxiosResponse } from "axios";
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
}
export class Handler {
    headers_base: Array<{}>;
    ax: AxiosInstance;
    constructor() {
        this.headers_base = [{
            //      "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
            //          "Content-Type": "application/json",
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246",
            "X-Riot-Token": process.env.RIOT_KEY
        }]
        this.ax = wrapper(
            axios.create({
                jar: new CookieJar(),
                baseURL: "",
                // withCredentials: true,
            })
        );
    }
    async valRequest(url: string, method: number, header_type: number, data = {}) {
        return  [await  this.sendPostRequest(url, this.headers_base[header_type], data), await this.sendGetRequest(url, this.headers_base[header_type]), await this.sendPutRequest(url, this.headers_base[header_type], data)][method] 
    }
    async sendPostRequest(url: string, headers: {}, data: {}) {
        this.ax.post(url, data, {
            headers: headers
        })
    }
    async sendGetRequest(url: string, headers: {}) {
        this.ax.post(url, {
            headers: headers
        })
    }
    async sendPutRequest(url: string, headers: {}, data: {}) {
        this.ax.put(url, data, {
            headers: headers
        })
    }
    async getAuthedHeaders(user: string, pass: string) {
        // get cookie
        let searchURL = await this.valRequest("https://auth.riotgames.com/api/v1/authorization", 0, 0, {
            "client_id": "play-valorant-web-prod",
            "nonce": "1",
            "redirect_uri": "https://playvalorant.com/opt_in",
            "response_type": "token id_token",
            "scope": "account openid"
        }).then(_ => {
            return this.valRequest(
                "https://auth.riotgames.com/api/v1/authorization", 1, 0,
                {
                    type: "auth",
                    username: user,
                    password: pass,
                    rememberDevice: true,
                }
            )
        }).then((_) => {
            yield _
        }
        )
        const urlSearch = new URLSearchParams(searchURL.hash)

        // this.access_token = String(urlSearch.get("#access_token"));
        // this.id_token = urlSearch.get("id_token") || "";
        // this.expires_in = Number(urlSearch.get("expires_in") || 0);
        // this.token_type = urlSearch.get("token_type") || "";
        // this.session_state = urlSearch.get("session_state") || "";

        await this.valRequest(
            "https://entitlements.auth.riotgames.com/api/token/v1", 0, 0,
            {
                "Authorization": `Bearer ${String(urlSearch.get("#access_token"))}`
            }
        ).then((res: AxiosResponse<EntitlementResponse>) => {
            return res.data.entitlements_token
        } ) }}
