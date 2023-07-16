import { AxiosInstance, AxiosResponse } from "axios";
import { PartyInviteResponse, PartyPlayerResponse } from "valorant-api-types";

export class Party {
    region = "ap";
    shard = "ap"
    async getPlayerParty(ax: AxiosInstance, ent: string, access: string, puuid: string): Promise<AxiosResponse<PartyPlayerResponse>> {
        return Promise.resolve(await ax.get(`https://glz-${this.region}-1.${this.shard}.a.pvp.net/parties/v1/players/${puuid}`, {
            headers: {
                "X-Riot-ClientVersion": "release-07.01-shipping-17-917901",
                "X-Riot-Entitlements-JWT": ent,
                "Authorization": `Bearer ${access}`
            }
        }))
    }
    async sendInvite(ax: AxiosInstance, ent: string, access: string, name: string, tag: string, party_id: string): Promise<AxiosResponse<PartyInviteResponse>> {
        return Promise.resolve(await ax.post(`https://glz-${this.region}-1.${this.shard}.a.pvp.net/parties/v1/parties/${party_id}/invites/name/${name}/tag/${tag}`, {}, {
            headers: {
                "X-Riot-ClientVersion": "release-07.01-shipping-17-917901",
                "X-Riot-Entitlements-JWT": ent,
                "Authorization": `Bearer ${access}`
            }
        }))
    }
}