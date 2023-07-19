import axios, { AxiosError, AxiosInstance, AxiosRequestHeaders, AxiosResponse } from "axios";
// import { Auth } from "./auth";
import { PlayerInfoResponse, StorefrontResponse, CurrentGameMatchResponse } from "valorant-api-types";
import { Handler } from "./valhandler";

export namespace ValUser {

}
export class Client extends Handler{
    entitlements_token(ax: AxiosInstance, entitlements_token: any, access_token: any, puuid: any): Promise<AxiosResponse<{ Subject: string; Version: number; Invites: null; Requests: { ID: string; PartyID: string; RequestedBySubject: string; Subjects: string[]; CreatedAt: string; RefreshedAt: string; ExpiresIn: number; }[]; CurrentPartyID: string; PlatformInfo: { ...; }; }, any>> {
        throw new Error("Method not implemented.");
    }
    // headers: {}
    user: string
    puuid : any 
    auth: any;
    async init(user: string, pass: string) {
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
    
}