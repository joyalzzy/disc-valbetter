import { CommandInteraction } from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import {
  Discord, Slash,
  SlashGroup,
  SlashOption
} from "discordx";
import { valorant } from "../main";

// @Discord()
// export class AllCommands {
  // example: pagination for all slash command
  // @Slash({
    // description: "Pagination for all slash command",
    // name: "all-commands",
  // })
  // async pages(interaction: CommandInteraction): Promise<void> {
    // const commands = MetadataStorage.instance.applicationCommands.map((cmd) => {
      // return { description: cmd?.description, name: cmd.name };
    // });
// 
    // const pages = commands.map((cmd, i) => {
      // const embed = new EmbedBuilder()
        // .setFooter({ text: `Page ${i + 1} of ${commands.length}` })
        // .setTitle("**Slash command info**")
        // .addFields({ name: "Name", value: cmd.name })
        // .addFields({
          // name: "Description",
          // value: `${
            // cmd.description.length > 0
              // ? cmd.description
              // : "Description unavailable"
          // }`,
        // });
// 
      // return { embeds: [embed] };
    // });
// 
    // const pagination = new Pagination(interaction, pages);
    // await pagination.send()
  // }
// }
// 


// @Discord()
// @SlashGroup({ description: "valorat stats", name: "stats"})
// export class StatsRoot {
  // @Slash({description: 'stats'}) 
  // async stats (inter: CommandInteraction) {
    // inter.reply('not implemented')
  // }
// }
// @Discord()
// export class StatsBase {
  // @Slash({description: 'not implemented', name: 'stats'})
  // async stats (interaction: CommandInteraction) {
    // return await interaction.reply('not implemented')
  // }
// }
@Discord()
@SlashGroup({ description: "valorant last stats", name: "last"})
@SlashGroup('last')
export class ValorantStatsChecker { 
  @Slash({
    description: "get kills for player",
    name: "kills",
  })
  async getKillsfromLast(
    @SlashOption({
      description: "in the formate of `username`#`tag`",
      name: "username",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    username: string,
    @SlashOption({
      description: "comp | unrated | swift | tdm | premier | replication (empty for all) ",
      name: "mode",
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    mode: string,
    interaction: CommandInteraction,
  ) {
    await interaction.deferReply();
    const args = username.split("#");
    try {
      await valorant
        .getPlayerPuuid(args[0], args[1])
        .then((_) => {
          return valorant.getUserLastMatchKills(_);
        })
        .then((_) => {
          return interaction.followUp(String(_));
        });
    } catch {
      return interaction.followUp("nah");
    }
  }
  @Slash({
    description: "get kd",
    name: "kd",
  }) 
  async getKDfromLast(
    @SlashOption({
      description: "in the formate of `username`#`tag`",
      name: "username",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    username: string,
    interaction: CommandInteraction
  ) {
    await interaction.deferReply();
    const args = username.split("#");
    try {
      await valorant
        .getPlayerPuuid(args[0], args[1])
        .then((_) => {
          return valorant.getUserLastMatchKD(_);
        })
        .then((_) => {
          return interaction.followUp(String(_));
        });
    } catch {
      return interaction.followUp("nah");
    }
  }
  @Slash({
    description: "full stats",
    name: "all",
  }) 
  async getAllStatsfromLast(
    @SlashOption({
      description: "in the formate of `username`#`tag`",
      name: "username",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    username: string,
    interaction: CommandInteraction
  ) {
    await interaction.deferReply();
    const args = username.split("#");
    const em = await valorant
      .getPlayerPuuid(args[0], args[1])
      .then(async (_) => {
        let mid = await valorant.getLastMatchID(_);
        return await valorant.getMatchInfo(mid).then((res) => {
          return valorant.parsePersonalMatchInfotoEmbed(args[0], args[1], _, res);
        });
      });
    return interaction.followUp({ embeds: [em] });
  }
}
