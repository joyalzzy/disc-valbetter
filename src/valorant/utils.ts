import { MatchDetailsResponse, partyChatInfoEndpoint, stringBooleanSchema } from "valorant-api-types";
import { Auth } from "./auth";
import { Party } from "./party";
import { AxiosInstance } from "axios";
import { User } from "discord.js";
import { ValUser } from "./user";
import { pid } from "process";

export async function getPlayerPuuid(ax: AxiosInstance, user: ValUser, name: string, tag: string) {
    const party = new Party();
    let pid = '';
    await Promise.resolve(party.getPlayerParty(ax, user.entitlements_token, user.auth.access_token, user.puuid)).then((res) => {
        pid = res.data.CurrentPartyID
    })
    // console.log(pid)
    return Promise.resolve(party.sendInvite(ax, user.auth.entitlements_token, user.auth.access_token, name, tag, pid)).then((res) => { 
        // console.log(res.data)
        return res.data.Invites![0]!['Subject'];
    })
}

export async function getPlayerKillsfromMatchResposne(match : MatchDetailsResponse, puuid : string){
    return match.players.find(x => x.subject == puuid)?.stats?.kills
}
