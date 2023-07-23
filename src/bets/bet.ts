import {
  ApplicationCommandChoicesData,
  ApplicationCommandOptionChoiceData,
  ApplicationCommandOptionType,
  AutocompleteInteraction,
  CommandInteraction,
  ContextMenuCommandAssertions,
  EmbedBuilder,
  InteractionCollector,
  UserManager,
} from "discord.js";
import { bot, valorant } from "../main.js";
import { randomUUID } from "crypto";
import { SlashOption } from "discordx";
import { kill } from "process";
import { AsciiTable3, AlignmentEnum } from "ascii-table3";

export class Bets {
  // initiator is discord id
  initiator_id: string;
  bet_id: string;
  bets: {
    id: string;
    price: number;
    bet: any;
  }[] = [];
  type: Bets.Types;
  puuid: string;
  last_mid: string;
  response_interaction: CommandInteraction;
  checktask: NodeJS.Timer;
  public static ongoing: Bets[] = [];
  public start(
    type: Bets.Types,
    initiator_id: string,
    puuid: string,
    last_mid: string,
    interaction: CommandInteraction
  ) {
    // init routine
    this.bet_id = randomUUID();
    this.type = type;
    this.initiator_id = initiator_id;
    this.puuid = puuid;
    this.last_mid = last_mid;
    this.response_interaction = interaction;
    Bets.ongoing.push(this);
    this.checktask = setInterval(async () => {
      const m = await this.checkMatchEnded();
      m ? this.concludeBets(<string>m) : console.log("not ended");
    }, 120000);
    //  testing
    // this.joinBet('1029380128', 24, 123)
    this.joinBet("585749546043179038", 50, 124);
    this.joinBet("355922031247884290", 20, 12);
    console.log(`started bets ${this.bet_id} of ${this.type}`);
    // choosing bets

    return true;
  }
  protected startKills() {}
  protected startDeaths() {}
  protected startKD() {}
  protected startMatchScore() {}
  public joinBet(id: string, price: number, bet: any) {
    this.bets.push({ id: id, price: price, bet: bet });
  }
  public async checkMatchEnded(): Promise<boolean | string> {
    console.log("checking");
    const mid = await valorant.getLastNMatchID(this.puuid);
    return mid !== this.last_mid ? mid : false;
  }
  public async concludeBets(mid: string): Promise<number> {
    clearInterval(this.checktask);
    console.log("ended");
    const match = await valorant.getMatchInfo(mid);
    console.log(match.data.matchInfo.customGameName);

    let kills =
      match.data.players.find((x) => x.subject == this.puuid)?.stats?.kills ??
      0;
    let rankings = this.bets
      .map((b) => {
        return { id: b.id, diff: Math.abs(b.bet - kills) };
      })
      .sort((a, b) => {
        return a.diff - b.diff;
      });

    Bets.ongoing = Bets.ongoing.filter((x) => x !== this);
    await this.response_interaction.channel!.send(`bet ${this.bet_id} ended`);
    await this.response_interaction.channel!.send({
      embeds: [
        new EmbedBuilder()
          .setTitle(`Results for ${await this.parseBetName()}`)
          .addFields({
            value: (await this.parseRankingsTable(kills, rankings)).toString(),
            name: "\u200b",
          }),
      ],
    });
    return 0
  }
  public async parseRankingsTable(
    kills: number,
    rankings: { id: string; diff: number }[]
  ) {
    return new AsciiTable3()
      .setHeading("Username", "Difference")
      .setAlignCenter(1)
      .addRowMatrix(
        await Promise.all(
          rankings.map(async (a) => {
            return [(await bot.users.fetch(a.id)).username, "±" + a.diff];
          })
        )
      );
    // return new EmbedBuilder().setTitle(``)
    // return 'rank id diff\n' + parsedL.join('\n')
  }
  public async parseBetName() {
    // await bot.users.fetch(this.initiator_id).then(res => {
    // res.
    // })
    return `${(await bot.users.fetch(this.initiator_id)).username} Bet on ${
      this.type
    }`;
  }
  public static async getAutocomplete() {
    let promses = Bets.ongoing.map(async (x) => {
      return { name: await x.parseBetName(), value: x.bet_id };
    });
    return Promise.all(promses);
  }
}
export namespace Bets {
  export enum Types {
    KILLS = "kills",
    DEATHS = "deaths",
    KD = "kd",
    MATCH_SCORE = "match score",
  }
  export const betOption = SlashOption({
    name: "bet",
    description: "type",
    autocomplete: async (interaction: AutocompleteInteraction) => {
      let auto = await Bets.getAutocomplete();
      interaction.respond(auto);
    },
    required: false,
    type: ApplicationCommandOptionType.String,
  });
}
