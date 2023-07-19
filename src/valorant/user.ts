import axios, { AxiosError, AxiosRequestHeaders, AxiosResponse } from "axios";
// import { Auth } from "./auth";
import { PlayerInfoResponse, StorefrontResponse, CurrentGameMatchResponse } from "valorant-api-types";
import { Handler } from "./valhandler";

export namespace ValUser {

}
export class ValUser extends Handler{
    // headers: {}
    user: string
    puuid : any 
    async createVal(user: string, pass: string) {
        this.user = user
        // this.pass = pass
        await this.setAuthedHeaders(user, pass)
        await this.setPuuid()
    }
    async setPuuid() {
        console.log(this.headers)
        await this.sendGetRequest('https://auth.riotgames.com/userinfo').then((res : AxiosResponse<PlayerInfoResponse>) => {
            // console.log(res)
            this.puuid = res.data.sub
            // console.log(res.data)
            // this.cache.setPuuid(this.user, )res.data.acct.
            // console.log(this.puuid)
        }).catch((err: AxiosError)=> console.log(err.config?.headers.toJSON()))
    } 
    async getCurrentMatch() : Promise<AxiosResponse<CurrentGameMatchResponse>> {
        return this.sendGetRequest(`https://pd.ap.a.pvp.net/store/v2/storefront/${this.puuid}`) 
    }
}