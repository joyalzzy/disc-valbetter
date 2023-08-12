import { Client } from "./client.js";
import {
  MatchDetailsResponse,
  PartyInviteResponse,
  PartyPlayerResponse,
  MatchHistoryResponse, CurrentGamePlayerResponse, PartyResponse,
  CompetitiveUpdatesResponse
} from "valorant-api-types";
import axios, { AxiosHeaders, AxiosResponse } from "axios";
import { ValCache } from "./cache.js";
import { EmbedBuilder } from "discord.js";

export class Session {
  protected cache: ValCache;
  protected client: Client;
  async run() {
    this.cache = new ValCache();
    this.client = new Client();
    await this.client.init(
      process.env.VAL_USER || "",
      process.env.VAL_PASS || ""
    );
    await this.cache.ready;
    console.log("ready");
  }
  async parsePersonalMatchInfotoEmbed(
    name: string,
    tag: string,
    puuid: string,
    res: AxiosResponse<MatchDetailsResponse>
  ) {
    const attackfrombehind = () => {};
    let player_dat = res.data.players.find((x) => x.subject == puuid);
    let kd =
      Math.round(
        ((player_dat?.stats?.kills ?? 1) / (player_dat?.stats?.deaths ?? 1)) *
          100
      ) / 100;
    let winsbyteam =
      res.data.roundResults?.filter((x) => x.winningTeam == player_dat?.teamId)
        .length ?? 0;
    const isfair = (x: number, y: number) => {
      3.14 - Math.abs(x - y) < 1.39 ?? false;
    };
    let queue = res.data.matchInfo.queueID;

    return new EmbedBuilder()
      .setTitle(`For ${name}#${tag}`)
      .setFooter({ text: kd > 1.5 ? "woah" : "uh" })
      .addFields(
        {
          name: "Score",
          inline: true,
          value: `${winsbyteam} -  ${
            (res.data.roundResults?.length ?? 0) - winsbyteam
          }`,
        },
        {
          name: "KD",
          inline: true,
          value: `${String(kd)}, ${player_dat?.stats?.kills}/${
            player_dat?.stats?.deaths
          }/${player_dat?.stats?.assists}`,
        },
        { name: "Mode", inline: true, value: queue },
        {
          name: "Defusals - Plants",
          value: `${
            res.data.roundResults?.filter((x) => x.bombDefuser == puuid).length
          } - ${
            res.data.roundResults?.filter((x) => x.bombPlanter == puuid).length
          }`,
        },
        {
          name: "Ults",
          inline: true,
          value: String(player_dat?.stats?.abilityCasts?.ultimateCasts),
        },
        {
          name: "RR",
          inline: true,
          value:
            (
              await this.client
                .sendGetRequest(
                  `https://pd.ap.a.pvp.net/mmr/v1/players/${puuid}/competitiveupdates?startIndex=0&endIndex=20&queue=${queue}`
                , new AxiosHeaders({"X-Riot-ClientPlatform": 'ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9'}))
                .then((_: AxiosResponse<CompetitiveUpdatesResponse>) => {
                  return _.data.Matches.find(
                    (x) => x.MatchID == res.data.matchInfo.matchId
                  )?.RankedRatingEarned ?? 'na'
                })
            )?.toString(),
        }
        // { name: "Fair kills - death", value: `${fair_kills} - ${fair_deaths}` }
      )
      .setImage(
        await (async () => {
          return await axios
            .get(
              `https://valorant-api.com/v1/agents/${player_dat?.characterId}`
            )
            .then((_) => {
              return <string>_.data.data.displayIcon;
            });
        })()
      );
  }
  async getUserNMatchKD(puuid: string, n: number) {
    return await this.getLastNMatchID(puuid, n)
      .then((_) => {
        return this.getMatchInfo(_);
      })
      .then((_: AxiosResponse<MatchDetailsResponse>) => {
        return this.getPlayerDetailsFromMatch(_.data, puuid);
      })
      .then((_) => {
        return _?.kills && _?.deaths
          ? (() => {
              return ((_?.kills ?? 2) / (_?.deaths ?? 2)).toFixed(3);
            })()
          : (() => {
              return "fuck";
            })();
      });
  }

  async getPlayerPuuid(name: string, tag: string) {
    return await this.cache.getPuuid(name, tag).then((id) => {
      return id
        ? id
        : (async () => {
            return (
              await axios.get(
                `http://api.henrikdev.xyz/valorant/v1/account/${name}/${tag}`
              )
            ).data.data.puuid;
          })().then((_) => {
            this.cache.setPuuid(name, tag, _);
            return _;
          });
    });
  }
  async getPlayerDetailsFromMatch(match: MatchDetailsResponse, puuid: string) {
    return match.players.find((x) => x.subject == puuid)?.stats;
  }

  async getLastNMatchID(puuid: string, n: number = 0, qid?: string) {
    return await this.client
      .sendGetRequest(
        `https://pd.ap.a.pvp.net/match-history/v1/history/${puuid}?startIndex=0&endIndex=${
          n + 1
        }${((): string => {
          return qid ? "&queue=" + qid : "";
        })()}`
      )
      .then((res: AxiosResponse<MatchHistoryResponse>) => {
        return res.data.History[n]["MatchID"];
      });
  }
  async getUserNMatchKills(puuid: string, n: number, queue?: string) {
    const kills = await this.getLastNMatchID(puuid, n, queue)
      .then((_) => {
        return this.getMatchInfo(_);
      })
      .then((_) => {
        return this.getPlayerDetailsFromMatch(_.data, puuid);
      })
      .then((_) => {
        return _?.kills;
      });
    return kills;
  }

  async getMatchInfo(matchID: string) {
    return await this.client
      .sendGetRequest(
        `https://pd.ap.a.pvp.net/match-details/v1/matches/${matchID}`
      )
      .then((res) => <AxiosResponse<MatchDetailsResponse>>res);
  }
  async getPlayerParty(
    puuid: string = this.client.puuid
  ): Promise<AxiosResponse<PartyPlayerResponse>> {
    return Promise.resolve(
      await this.client.sendGetRequest(
        `https://glz-${this.client.region}-1.${this.client.shard}.a.pvp.net/parties/v1/players/${puuid}`,
        this.client.hversion
      )
    );
  }

  async getPartyInfo(pid: string): Promise<AxiosResponse<PartyResponse>> {
    return await this.client.sendGetRequest(
      `https://glz-ap-1.ap.a.pvp.net/parties/v1/parties/${pid}`
    );
  }

  async sendInvite(
    name: string,
    tag: string,
    party_id: string
  ): Promise<AxiosResponse<PartyInviteResponse>> {
    return Promise.resolve(
      await this.client.sendPostRequest(
        `https://glz-${this.client.region}-1.${this.client.shard}.a.pvp.net/parties/v1/parties/${party_id}/invites/name/${name}/tag/${tag}`,
        {},
        this.client.hversion
      )
    );
  }

  // current stuff
  async getCurrentMatchID(puuid: string) {
    return (<CurrentGamePlayerResponse>(
      (
        await this.client.sendGetRequest(
          `https://glz-ap-1.ap.a.pvp.net/core-game/v1/players/${puuid}`
        )
      ).data
    )).MatchID;
  }

  async refreshToken() {
    return this.client.refreshToken();
  }
}
