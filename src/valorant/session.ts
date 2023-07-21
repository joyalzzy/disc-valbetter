// import { Auth } from "./auth";
// import { Match } from "./match";
// import { Party } from "./party";
// import { ValUser } from "./client";
import { Client } from "./client";
import {
  CurrentGameMatchResponse,
  MatchDetailsResponse,
  PartyInviteResponse,
  PartyPlayerResponse,
  chatSessionEndpoint,
} from "valorant-api-types";
import axios, { Axios, AxiosResponse } from "axios";
import { ValCache } from "./cache";
import { bot } from "../main";
import { Embed, EmbedBuilder } from "discord.js";

export class Session {
  async parsePersonalMatchInfotoEmbed(
    name: string,
    tag: string,
    puuid: string,
    res: AxiosResponse<MatchDetailsResponse>
  ) {
    // let k = await this.getUserLastMatchKD(puuid)
    const attackfrombehind = () => {};
    let player_dat = res.data.players.find((x) => x.subject == puuid);
    let kd = Math.round(
        ((player_dat?.stats?.kills ?? 1) / (player_dat?.stats?.deaths ?? 1)) *
          100
      ) / 100;
    let winsbyteam =
      res.data.roundResults?.filter((x) => x.winningTeam == player_dat?.teamId)
        .length ?? 0;
    const isfair = (x: number, y: number) => {
      3.14 - Math.abs(x - y) < 1.39 ?? false;
    };

    // let fair_kills = res.data.kills
      // ?.filter((x) => x.killer == puuid)
      // .map((x) => {
        // console.log(x.playerLocations)
        // let victim_view =
          // x.playerLocations.find((y) => y.subject == x.victim)?.viewRadians ??
          // 0;
        // let player_view =
          // x.playerLocations.find((y) => y.subject == x.killer)?.viewRadians ??
          // 0;
// 
        // return isfair(victim_view, player_view);
      // })
      // .filter(Boolean).length;
    // let fair_deaths = res.data.kills
      // ?.filter((x) => x.victim == puuid)
      // .map((x) => {
        // let victim_view =
          // x.playerLocations.find((y) => y.subject == puuid)?.viewRadians ?? 0;
        // let player_view =
          // x.playerLocations.find((y) => y.subject == x.killer)?.viewRadians ??
          // 0;
        // console.log(`views ${victim_view} ${player_view}`);
        // return isfair(victim_view, player_view);
      // })
      // .filter(Boolean).length;
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
        { name: "Mode", inline: true, value: res.data.matchInfo.queueID },
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
        // { name: "Fair kills - death", value: `${fair_kills} - ${fair_deaths}` }
      )
      .setImage(await (async () => {
        return  await  axios
          .get(`https://valorant-api.com/v1/agents/${player_dat?.characterId}`)
          .then((_) => {
            return <string>_.data.data.displayIcon ;
          });
     })())
  }
  async getUserNMatchKD(puuid: string, n : number) {
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

    // throw new Error("Method not implemented.");
  }
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
    // console.log(await this.cache.getPuuid('whiffdemon', 'luvcb'))
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
      // : (async () => {
      // const res = await this.getPlayerParty(this.client.puuid);
      // const res_1 = await this.sendInvite(
      // name,
      // tag,
      // res.data.CurrentPartyID
      // );
      // const id = <string>res_1.data.Invites![0]["Subject"];
      // console.log(id)
      // this.cache.setPuuid(name, tag, id);
      // return id;
      // })();
      // }).catch(async () => {return (await axios.get(`http://api.henrikdev.xyz/valorant/v1/account/${name}/${tag}`)).data.data.puuid}).then(_ => {
      // this.cache.setPuuid(name, tag, _)
      // return _
      // }).catch(_ => {
      // throw Error('Not found')
      // });
    });
  }
  async getPlayerDetailsFromMatch(match: MatchDetailsResponse, puuid: string) {
    return match.players.find((x) => x.subject == puuid)?.stats;
  }

  // async getCurrentMatch(
    // puuid: string
  // ): Promise<AxiosResponse<CurrentGameMatchResponse>> {
    // return await this.client.sendGetRequest(
      // `https://pd.ap.a.pvp.net/store/v2/storefront/${puuid}`
    // );
  // }
  async getLastNMatchID(puuid: string, n : number, qid?: string ) {
    return await this.client
      .sendGetRequest(
        `https://pd.ap.a.pvp.net/match-history/v1/history/${puuid}?startIndex=0&endIndex=${n+1}${(() : string => {
          return qid ? '&queue=' + qid : ''
        })()}`
        //?startIndex={startIndex}&endIndex={endIndex}&queue={queue}`, {
      )
      .then((res) => {
        return res.data.History[n]["MatchID"];
      });
  }
  async getUserNMatchKills(puuid: string, n: number, queue? : string) {
    const kills = await this.getLastNMatchID(puuid,n, queue )
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
      //?startIndex={startIndex}&endIndex={endIndex}&queue={queue}`, {)
      .then((res) => res);
  }
  async getPlayerParty(
    puuid: string
  ): Promise<AxiosResponse<PartyPlayerResponse>> {
    return Promise.resolve(
      await this.client.sendGetRequest(
        `https://glz-${this.client.region}-1.${this.client.shard}.a.pvp.net/parties/v1/players/${puuid}`,
        this.client.hversion
      )
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
}
