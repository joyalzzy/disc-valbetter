import {
  ApplicationCommandChoicesData,
  ApplicationCommandOptionChoiceData,
  ApplicationCommandOptionType,
  AutocompleteInteraction,
  CommandInteraction,
  InteractionCollector,
  UserManager,
} from "discord.js";
import { bot, valorant } from "../main";
import { randomUUID } from "crypto";
import { SlashOption } from "discordx";

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
  response_interaction: CommandInteraction;
  checktask : NodeJS.Timer;
  public static ongoing: Bets[] = [];
  public start(
    type: Bets.Types,
    initiator_id: string,
    puuid: string,
    last_mid: string,
    interaction: CommandInteraction
  ) {
    // init routine
    this.bet_id = randomUUID()
    this.type = type;
    this.initiator_id = initiator_id;
    this.puuid = puuid;
    this.last_mid = last_mid;
    this.response_interaction = interaction
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
    return (mid !== this.last_mid) ? mid : false
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
    await this.response_interaction.channel!.send(`bet ${this.bet_id} ended`)
    return "";
  }
  public async parseBetName() {
    // await bot.users.fetch(this.initiator_id).then(res => {
    // res.
    // })
    return `${(await bot.users.fetch(this.initiator_id)).username} Bet on ${this.type}`;
  }
  public static async getAutocomplete() {
    let promses = Bets.ongoing.map(async (x) => {return {name: await x.parseBetName(), value: x.bet_id}});
    return Promise.all(promses)
  }
}
export namespace Bets {
  export enum Types {
    KILLS = "kills",
    DEATHS = "deaths",
    KD = "kd",
    MATCH_SCORE = "match score",
  }
  export const betOption = SlashOption( {
      name: "bet",
      description: "type",
      autocomplete: async (interaction: AutocompleteInteraction) => {
        let auto = await Bets.getAutocomplete()
        interaction.respond(auto);
      },
      required: false,
      type: ApplicationCommandOptionType.String,
    })
}
