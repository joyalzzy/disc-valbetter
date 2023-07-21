import { CommandInteraction } from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { Discord, Slash, SlashGroup, SlashOption } from "discordx";
import { valorant } from "../main";
import axios from "axios";
import { MatchDetailsResponse, queueIDSchema } from "valorant-api-types";
import { parseQID } from "../valorant/utils";
import { parse } from "path";
import { nOption, queueOption, usernameOption } from "../utils/commonOptions";

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
@SlashGroup({ description: "valorant last stats", name: "last" })
@SlashGroup("last")
export class ValorantStatsChecker {

  @Slash({
    description: "get kills for player",
    name: "kills",
  })
  async getKillsfromLast(
    @usernameOption 
    username: string,
    @queueOption
    queue: string,
    @nOption
    n: number = 0,
    interaction: CommandInteraction
  ) {
    await interaction.deferReply();
    const args = username.split("#");
    try {
      await valorant
        .getPlayerPuuid(args[0], args[1])
        .then((_) => {
          return valorant.getUserNMatchKills(_, n, queue);
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
  async getKDfromNLast(
    
    @usernameOption 
    username: string,
    // @queueOption
    // queue: string,
    @nOption
    n: number = 0,
    interaction: CommandInteraction
  ) {
    await interaction.deferReply();
    const args = username.split("#");
    try {
      await valorant
        .getPlayerPuuid(args[0], args[1])
        .then((_) => {
          return valorant.getUserNMatchKD(_, n);
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
    @usernameOption 
    username: string,
    @queueOption
    queue: string,
    @nOption
    n: number = 0,
    interaction: CommandInteraction
  ) {
    await interaction.deferReply();
    const args = username.split("#");
    const em = await valorant
      .getPlayerPuuid(args[0], args[1])
      .then(async (_) => {
        let mid = await valorant.getLastNMatchID(_, n, queue);
        return await valorant.getMatchInfo(mid).then((res) => {
          return valorant.parsePersonalMatchInfotoEmbed(
            args[0],
            args[1],
            _,
            res
          );
        });
      });
    return interaction.followUp({ embeds: [em] });
  }
}
