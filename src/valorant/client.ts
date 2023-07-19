import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestHeaders,
  AxiosResponse,
} from "axios";
// import { Auth } from "./auth";
import {
  PlayerInfoResponse,
  StorefrontResponse,
  CurrentGameMatchResponse,
} from "valorant-api-types";
import { Handler } from "./valhandler";

export namespace ValUser {}
export class Client extends Handler {
  // headers: {}
  user: string;
  puuid: any;
  // auth: any;
  region: any;
  shard: any;
  async init(user: string, pass: string) {
    this.hversion = {'X-Riot-ClientVersion': (await this.ax.get('https://valorant-api.com/v1/version')).data.data.version}
    this.region = 'ap';
    this.shard = 'ap';
    this.user = user;
    // this.pass = pass
    await this.setAuthedHeaders(user, pass);
    await this.setPuuid();
  }
  async setPuuid() {
    await this.sendGetRequest("https://auth.riotgames.com/userinfo")
      .then((res: AxiosResponse<PlayerInfoResponse>) => {
        // console.log(res)
        this.puuid = res.data.sub;
        // console.log(res.data)
        // this.cache.setPuuid(this.user, )res.data.acct.
        // console.log(this.puuid)
      })
      .catch((err: AxiosError) => console.log(err.config?.headers.toJSON()));
  }
}
