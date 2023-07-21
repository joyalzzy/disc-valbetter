import {
  ApplicationCommandOptionType,
  ApplicationCommandOptionWithChoicesAndAutocompleteMixin,
  AutocompleteInteraction,
  CommandInteraction,
  InteractionCollector,
} from "discord.js";
import { SlashOption } from "discordx";

export const queueOption = SlashOption({
  description:
    "comp | unrated | swift | tdm | premier | replication (empty for all) ",
  autocomplete: (int: AutocompleteInteraction) => {
    int.respond([
      { name: "competitive", value: "competitive" },
      { name: "custom", value: "custom" },
      { name: "deathmatch", value: "deathmatch" },
      { name: "ggteam", value: "ggteam" },
      { name: "hurm", value: "hurm" },
      { name: "newmap", value: "newmap" },
      { name: "onefa", value: "onefa" },
      { name: "premier", value: "premier" },
      { name: "snowball", value: "snowball" },
      { name: "spikerush", value: "spikerush" },
      { name: "swiftplay", value: "swiftplay" },
      { name: "unrated", value: "unrated" },
    ]);
  },
  name: "queue",
  required: false,
  type: ApplicationCommandOptionType.String,
  // transformer: parseQID
});
export const nOption = SlashOption({
  description: "number from last 1 for the 2nd in list",
  name: "n",
  required: false,
  type: ApplicationCommandOptionType.Number,
});

export const usernameOption = SlashOption({
  description: "in the formate of `username`#`tag`",
  name: "username",
  required: true,
  type: ApplicationCommandOptionType.String,
});
