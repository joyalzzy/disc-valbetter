import {
  ApplicationCommandOptionType,
  AutocompleteInteraction,
  CommandInteraction,
  Embed,
  EmbedBuilder,
} from "discord.js";
import { Discord, Slash, SlashGroup, SlashOption } from "discordx";
import {
  fixdata,
  getAutocompleteSuggestions,
  sortedStops,
  getStopInfo,
  getArrival,
  parseAll,
} from "../busses/bus.js";

// const sortedStops = fixdata()
const stopAutocompleted = SlashOption({
  name: "stop",
  description: "bus stop name",
  required: true,
  type: ApplicationCommandOptionType.String,
  autocomplete: (interaction: AutocompleteInteraction) => {
    let a = interaction.options.getFocused();
    let res = getAutocompleteSuggestions(sortedStops, a != "" ? a : "a").splice(
      0,
      24
    );
    interaction.respond(res);
  },
});

@Discord()
@SlashGroup({
  name: "bus",
  description: "bus commands",
})
@SlashGroup("bus")
export class BusCommaands {
  @Slash({
    name: "id",
    description: "get bus stop info",
  })
  async getID(
    @stopAutocompleted
    stop: string,
    interaction: CommandInteraction
  ) {
    await interaction.reply(stop);
  }
  @Slash({
    name: "info",
    description: "info for stop",
  })
  async getInfo(
    @stopAutocompleted
    stop: string,
    interaction: CommandInteraction
  ) {
    let i = stop.split(',') 
    let stopdat = await parseAll(i[1])
    await interaction.reply({
      embeds: [
        new EmbedBuilder().setTitle(i[0] ?? '')
        .setFields({
          name: "stops",
          value: stopdat ?? ''
        }),
      ],
    });
  }
}
