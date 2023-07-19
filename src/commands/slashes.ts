import { Pagination } from "@discordx/pagination";
import { CommandInteraction } from "discord.js";
import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { Discord, MetadataStorage, Slash, SlashOption } from "discordx";
import { valorant } from "../main";

@Discord()
export class AllCommands {
  // example: pagination for all slash command
  @Slash({
    description: "Pagination for all slash command",
    name: "all-commands",
  })
  async pages(interaction: CommandInteraction): Promise<void> {
    const commands = MetadataStorage.instance.applicationCommands.map((cmd) => {
      return { description: cmd?.description, name: cmd.name };
    });

    const pages = commands.map((cmd, i) => {
      const embed = new EmbedBuilder()
        .setFooter({ text: `Page ${i + 1} of ${commands.length}` })
        .setTitle("**Slash command info**")
        .addFields({ name: "Name", value: cmd.name })
        .addFields({
          name: "Description",
          value: `${
            cmd.description.length > 0
              ? cmd.description
              : "Description unavailable"
          }`,
        });

      return { embeds: [embed] };
    });

    const pagination = new Pagination(interaction, pages);
    await pagination.send();
  }
}
@Discord()
export class getKillsForLastMatch {
  @Slash({
    description: "get last kills for match for user",
    name: "lastmatchkills",
  })
  async getKillsfromLast(
    @SlashOption({
      description: "username",
      name: "username",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    username: string,
    interaction: CommandInteraction
  ) {
    await interaction.deferReply()
    const args = username.split("#");
    try {
    await valorant.getPlayerPuuid(args[0], args[1])
      .then((_) => {
        return valorant.getUserLastMatchKills(_);
      })
      .then((_) => {
        return interaction.followUp(String(_));
      });} catch{ 
        return interaction.followUp('nah')
      }
  }
  @Slash({
    description: "idk",
    name: "lastmatch"
  })
  async thing () {}
}
