import { MatchDetailsResponse, MatchHistoryResponse, authCookiesEndpoint } from "valorant-api-types";
import { Auth } from "./auth";
import "dotenv/config";
import { ValUser } from "./user";
import { AxiosInstance, AxiosResponse } from "axios";

export class Match {
    async getLastMatchID(ax: AxiosInstance, puuid: string, auth: Auth)  {
        return Promise.resolve(await ax.get(`https://pd.ap.a.pvp.net/match-history/v1/history/${puuid}`, { //?startIndex={startIndex}&endIndex={endIndex}&queue={queue}`, {
            headers: {
                "X-Riot-Entitlements-JWT": auth.entitlements_token,
                "Authorization": `Bearer ${auth.access_token}`
            }
        }).then(res  => {
            return res.data.History[0]['MatchID'];
        }))

    }
    async getUserMatchKills(pgid: string, mid: string) {

    }
    async getMatchInfo(ax: AxiosInstance, auth: Auth, matchID: string) : Promise<AxiosResponse<MatchDetailsResponse>>{
        return await ax.get(`https://pd.ap.a.pvp.net/match-details/v1/matches/${matchID}`, { //?startIndex={startIndex}&endIndex={endIndex}&queue={queue}`, {
            headers: {
                "X-Riot-Entitlements-JWT": auth.entitlements_token,
                "Authorization": `Bearer ${auth.access_token}`
            }
        }).then (res  => 
             res
        );
    }
}