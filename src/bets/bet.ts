import {
  ApplicationCommandChoicesData,
  ApplicationCommandOptionChoiceData,
  UserManager,
} from "discord.js";
import { bot, valorant } from "../main";
import { randomUUID } from "crypto";

export class Bets {
  // initiator is discord id
  initiator_id: string;
  bet_id: string
  bets: {
    id: string;
    amount: number;
    bet: any;
  }[];
  type: Bets.Types;
  puuid: string;
  last_mid: string;
  checktask : NodeJS.Timer;
  public static ongoing: Bets[] = [];
  public start(
    type: Bets.Types,
    initiator_id: string,
    puuid: string,
    last_mid: string
  ) {
    // init routine
    this.bet_id = randomUUID()
    this.type = type;
    this.initiator_id = initiator_id;
    this.puuid = puuid;
    this.last_mid = last_mid;
    Bets.ongoing.push(this);
    this.checktask = setInterval(async () => {
      const m = await this.checkMatchEnded()
      m ? this.concludeBets(<string>m) : console.log('not ended')}, 120000)
    console.log(`started bets ${this.bet_id}`)
    // choosing bets

    return true;
  }
  protected startKills() {}
  protected startDeaths() {}
  protected startKD() {}
  protected startMatchScore() {}
  public joinBet(id: string, amount: number, bet: any) {
    this.bets.push({ id: id, amount: amount, bet: bet });
  }
  public async checkMatchEnded() : Promise<boolean | string> {
    console.log('checking')
    const mid = await valorant.getLastNMatchID(this.puuid) 
    return (mid == this.last_mid) ? mid : false
  }
  public async concludeBets(mid: string): Promise<string> {
    clearInterval(this.checktask)
    console.log('ended')
    const match = (await valorant.getMatchInfo(mid));
    console.log(match.data.matchInfo.customGameName)
    switch (this.type) {
      case Bets.Types.KILLS:
        match.data.players.find((x) => x.subject == this.puuid)?.stats?.kills;
      case Bets.Types.DEATHS:
        this.startDeaths();
      case Bets.Types.KD:
        this.startKD();
      case Bets.Types.MATCH_SCORE:
        this.startMatchScore();
    }
    Bets.ongoing = Bets.ongoing.filter((x) => x !== this);
    return "";
  }
  public parseBetName() {
    // await bot.users.fetch(this.initiator_id).then(res => {
    // res.
    // })
    return `<@${this.initiator_id}> Bet on ${this.type}`;
  }
  public static getAutocomplete(): ApplicationCommandOptionChoiceData[] {
    return Bets.ongoing.map((x) => {return {name: x.parseBetName(), value: x.bet_id}});
  }
}
export namespace Bets {
  export enum Types {
    KILLS = "kills",
    DEATHS = "deaths",
    KD = "kd",
    MATCH_SCORE = "match score",
  }
}
