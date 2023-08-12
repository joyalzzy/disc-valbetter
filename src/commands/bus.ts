import {
  ApplicationCommandOptionType,
  AutocompleteInteraction,
  CommandInteraction
} from "discord.js";
import { Discord, Slash, SlashGroup, SlashOption } from "discordx";
import {
  getAutocompleteSuggestions,
  sortedStops, parseAllServicesCommandEmbed,
  getRoadInfo,
  getOverviewResponse
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
    let stopdat = await parseAllServicesCommandEmbed(i[1])
    await interaction.reply({
      embeds: [
        stopdat.setTitle(i[0]) 
      ],
    });
  }
  @Slash({
    name: 'traffic',
    description: "get traffic info"
  })
  async getTraffic(interaction: CommandInteraction) {
    await interaction.reply((await getRoadInfo()).value.filter(x => x.Type != 'Roadwork').map((x) => {
      return `${x.Message}, ${x.Type} at ${x.Latitude},${x.Longitude}`
    }).join('\n').slice(0, 2000))
  } 
  @Slash({
    name: 'overview',
    description: 'get overview of traffic conditions'
  })
  async getOverview(interaction: CommandInteraction) {
    await interaction.deferReply()
    await interaction.followUp(await getOverviewResponse())
  }
}
