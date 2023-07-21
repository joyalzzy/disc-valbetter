import {
  Discord,
  Slash,
  SlashAutoCompleteOption,
  SlashGroup,
  SlashOption,
} from "discordx";
import { usernameOption } from "../utils/commonOptions";
import {
  ApplicationCommand,
  ApplicationCommandOptionType,
  AutocompleteInteraction,
  CommandInteraction,
} from "discord.js";
import { Bets } from "../bets/bet";
import { valorant } from "../main";

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
      name: "what",
      description: "the bet else the most recent",
      autocomplete: (interaction: AutocompleteInteraction) => {
        interaction.respond(Bets.getAutocomplete());
      },
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    bet_id: string,
    interaction: CommandInteraction
  ) {
    interaction.deferReply()
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
    await interaction.deferReply()
    const bet = new Bets();
    const args = username.split("#")
    const puuid = await valorant.getPlayerPuuid(
      args[0],
      args[1]
    );
    const mid = await valorant.getLastNMatchID(puuid);
    return await interaction.followUp(bet.start(Bets.Types.KILLS, interaction.user.id, puuid, mid)? 'Joined Bet' : 'Failed for some reason') 
  }
}
