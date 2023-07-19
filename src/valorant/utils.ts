import {
  CurrentGameMatchResponse,
  MatchDetailsResponse,
  PartyInviteResponse,
  partyChatInfoEndpoint,
  stringBooleanSchema,
} from "valorant-api-types";
import { Auth } from "./auth";
import { Party } from "./party";
import { AxiosInstance, AxiosResponse } from "axios";
import { Client } from "./client";
// import { ValUser } from "./client";
import { pid } from "process";

export async function getPlayerPuuid(
  client: Client,
  name: string,
  tag: string
) {
  const party = new Party();
  let pid = "";
  await Promise.resolve(
    party.getPlayerParty(
      client,
      client.entitlements_token,
      client.auth.access_token,
      client.puuid
    )
  ).then((res) => {
    pid = res.data.CurrentPartyID;
  });
  // console.log(pid)
  return Promise.resolve(
    party.sendInvite(
      client,
      client.auth.entitlements_token,
      client.auth.access_token,
      name,
      tag,
      pid
    )
  ).then((res) => {
    // console.log(res.data)
    return res.data.Invites![0]!["Subject"];
  });
}

export async function getPlayerKillsfromMatchResposne(
  match: MatchDetailsResponse,
  puuid: string
) {
  return match.players.find((x) => x.subject == puuid)?.stats?.kills;
}

export async function getCurrentMatch(
  client: Client,
  puuid: string
): Promise<AxiosResponse<CurrentGameMatchResponse>> {
  return await client.sendGetRequest(
    `https://pd.ap.a.pvp.net/store/v2/storefront/${puuid}`
  );
}
export async function getLastMatchID(client: Client, puuid: string) {
  return Promise.resolve(
    await client
      .sendGetRequest(
        `https://pd.ap.a.pvp.net/match-history/v1/history/${puuid}`,
        {
          //?startIndex={startIndex}&endIndex={endIndex}&queue={queue}`, {
        }
      )
      .then((res) => {
        return res.data.History[0]["MatchID"];
      })
  );
}
export async function getUserMatchKills(
  pgid: any,
  string: any,
  mid: any,
  string1: any
) {
  throw new Error("Function not implemented.");
}

export async function getMatchInfo(client: Client, matchID: string) {
  return await client
    .sendGetRequest(
      `https://pd.ap.a.pvp.net/match-details/v1/matches/${matchID}`
    )
    //?startIndex={startIndex}&endIndex={endIndex}&queue={queue}`, {)
    .then((res) => res);
}
export async function getPlayerParty(
  ax: AxiosInstance,
  ent: string,
  access: string,
  puuid: string
): Promise<AxiosResponse<PartyPlayerResponse>> {
  return Promise.resolve(
    await ax.get(
      `https://glz-${this.region}-1.${this.shard}.a.pvp.net/parties/v1/players/${puuid}`,
      {
        headers: {
          "X-Riot-ClientVersion": "release-07.01-shipping-17-917901",
          "X-Riot-Entitlements-JWT": ent,
          Authorization: `Bearer ${access}`,
        },
      }
    )
  );
}
export async function sendInvite(
  client: Client,
  name: string,
  tag: string,
  party_id: string
): Promise<AxiosResponse<PartyInviteResponse>> {
  return Promise.resolve(
    await client.sendGetRequest(
      `https://glz-${this.region}-1.${this.shard}.a.pvp.net/parties/v1/parties/${party_id}/invites/name/${name}/tag/${tag}`,
      {}
    )
  );
}
