import axios, { AxiosRequestHeaders, AxiosResponse } from "axios";
import { Auth } from "./auth";
import { PlayerInfoResponse, StorefrontResponse, CurrentGameMatchResponse } from "valorant-api-types";

export namespace ValUser {

}
export class ValUser {
    auth: Auth
    headers: {}
    puuid : any 
    async createVal(user: string, pass: string) {
        this.auth = new Auth()
        await this.auth.auth(user, pass)
        this.headers = {
            "X-Riot-Entitlements-JWT": this.auth.entitlements_token,
            "Authorization": `Bearer ${this.auth.access_token}`,
            "X-Riot-Token": process.env.RIOT_KEY
        }
        await this.getPuuid()
    }
    async getPuuid() {
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