import axios, { AxiosRequestHeaders, AxiosResponse } from "axios";
import { Auth } from "./auth";
import { PlayerInfoResponse, StorefrontResponse, CurrentGameMatchResponse } from "valorant-api-types";

export namespace ValUser {

}
export class ValUser extends Auth{
    headers: {}
    puuid : any 
    async createVal(user: string, pass: string) {
        await this.auth(user, pass)
        this.headers = {
            "X-Riot-Entitlements-JWT": this.entitlements_token,
            "Authorization": `Bearer ${this.access_token}`,
            "X-Riot-Token": process.env.RIOT_KEY
        }
        await this.setPuuid()
    }
    async setPuuid() {
        await axios.get('https://auth.riotgames.com/userinfo',  {
            headers: {
                Authorization: `Bearer ${this.auth.access_token}`
            }
        }).then((res : AxiosResponse<PlayerInfoResponse>) => {
            // console.log(res)
            this.puuid = res.data.sub
            // console.log(this.puuid)
        })
    } 
    async getCurrentMatch() : Promise<AxiosResponse<CurrentGameMatchResponse>> {
        return Promise.resolve(await axios.get(`https://pd.ap.a.pvp.net/store/v2/storefront/${this.puuid}`)) 
    }
}