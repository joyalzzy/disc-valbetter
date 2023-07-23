import {
  Discord,
  Slash,
  SlashAutoCompleteOption,
  SlashGroup,
  SlashOption,
} from "discordx";
import { usernameOption } from "../utils/commonOptions.js";
import {
  ApplicationCommand,
  ApplicationCommandOptionType,
  AutocompleteInteraction,
  CommandInteraction,
} from "discord.js";
import { Bets } from "../bets/bet.js";
import { valorant } from "../main.js";

@Discord()
@SlashGroup({ description: "bet", name: "bet" })
@SlashGroup("bet")
export class BetsCommands {
  @Slash({
    description: "join bet",
    name: "join",
  })
  async joinBet(
    @SlashOption({
      name: "amount",
      description: "what is your bet",
      required: true,
      type: ApplicationCommandOptionType.Number,
    })
    bet: number,
    @Bets.betOption
    bet_id: string,

    interaction: CommandInteraction
  ) {
    Bets.ongoing
      .find((x) => x.bet_id == bet_id)
      ?.joinBet(interaction.user.id, 120, bet);
    await interaction.reply("Joined bet");
  }
  @Slash({
    description: "start bet",
    name: "start",
  })
  async start(
    @usernameOption
    username: string,
    @SlashOption({
      name: "type",
      description: "type of bet to bet for (unimplemented only kills)",
      autocomplete: (interaction: AutocompleteInteraction) => {
        interaction.respond([{ name: "kills", value: "kills" }]);
      },
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    bettype: string,
    interaction: CommandInteraction
  ) {
    await interaction.deferReply();
    const bet = new Bets();
    const args = username.split("#");
    const puuid = await valorant.getPlayerPuuid(args[0], args[1]);
    const mid = await valorant.getLastNMatchID(puuid);
    return await interaction.followUp(
      bet.start(Bets.Types.KILLS, interaction.user.id, puuid, mid, interaction)
        ? "Started Bet"
        : "Failed for some reason"
    );
  }
  @Slash({ name: "check", description: "check if bet is resolved" })
  async check(
    @Bets.betOption
    bet: string,
    interaction: CommandInteraction
  ) {
    await interaction.reply(
      `has it ${await Bets.ongoing
        .find((x) => x.bet_id == bet)
        ?.checkMatchEnded()}`
    );
  }
  @Slash({ name: "forceconclude", description: "force stop of bet" })
  async conclude(
    @Bets.betOption
    bet: string,
    @SlashOption({
      name: "matchid",
      description: "match id",
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    matchid: string,
    interaction: CommandInteraction
  ) {
    await interaction.reply(
      `${await Bets.ongoing
        .find((x) => x.bet_id == bet)
        ?.concludeBets(matchid)}`
    );
  }
}
