import { AxiosError, AxiosResponse } from "axios";
import { PlayerInfoResponse } from "valorant-api-types";
import { Handler } from "./valhandler";

export namespace ValUser {}
export class Client extends Handler {
  user: string;
  puuid: any;
  region: any;
  shard: any;
  async init(user: string, pass: string) {
    this.hversion = {
      "X-Riot-ClientVersion": (
        await this.ax.get("https://valorant-api.com/v1/version")
      ).data.data.version,
    };
    this.region = "ap";
    this.shard = "ap";
    this.user = user;
    await this.setAuthedHeaders(user, pass);
    await this.setPuuid();
  }
  async setPuuid() {
    await this.sendGetRequest("https://auth.riotgames.com/userinfo")
      .then((res: AxiosResponse<PlayerInfoResponse>) => {
        this.puuid = res.data.sub;
      })
      .catch((err: AxiosError) => console.log(err.config?.headers.toJSON()));
  }
}
