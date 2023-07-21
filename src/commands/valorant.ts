import { CommandInteraction } from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { Discord, Slash, SlashGroup, SlashOption } from "discordx";
import { valorant } from "../main";
import axios from "axios";
import { MatchDetailsResponse, queueIDSchema } from "valorant-api-types";

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
export namespace Valorant {
  export enum QueueID {
    UNRATED='96bd3920-4f36-d026-2b28-c683eb0bcac5',
    DEATHMATCH="a8790ec5-4237-f2f0-e93b-08a8e89865b2",
    ESCALATION='a4ed6518-4741-6dcb-35bd-f884aecdc859',
    TDM="e086db66-47fd-e791-ca81-06a645ac7661",
    REPLICATION="4744698a-4513-dc96-9c22-a9aa437e4a58",
    SPIE_RUSH="e921d1e6-416b-c31f-1291-74930c330b7b",
    SNOWBALL="57038d6d-49b1-3a74-c5ef-3395d9f23a97",
    SWIFTPLAY="5d0f264b-4ebe-cc63-c147-809e1374484b"
  }
}
@Discord()
@SlashGroup({ description: "valorant last stats", name: "last" })
@SlashGroup("last")
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
      description:
        "comp | unrated | swift | tdm | premier | replication (empty for all) ",
      name: "queue",
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    queue: string,
    @SlashOption({
      description: "n from last",
      name: "n",
      required: false,
      type: ApplicationCommandOptionType.Number,
    })
    n: number,
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
    @SlashOption({
      description: "in the formate of `username`#`tag`",
      name: "username",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    username: string,
    @SlashOption({
      description: "n from last match",
      name: "n",
      required: false,
      type: ApplicationCommandOptionType.Number,
    })
    n: number,
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
    @SlashOption({
      description: "in the formate of `username`#`tag`",
      name: "username",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    username: string,
    @SlashOption({
      description:
        "comp | unrated | swift | tdm | premier | replication (empty for all) ",
      name: "queue",
      required: false,
      type: ApplicationCommandOptionType.String,
      transformer: (queue, interaction) : queueID=> {
        return['competitive', 'custom', 'deathmatch', 'ggteam','hurm', 'newmap', 'onefa', 'premier','snowball','spikerush','swiftplay','unrated']
      }
    })
    queue: Valorant.QueueID,
    @SlashOption({
      description: "number from last 1 for the 2nd in list",
      name: "n",
      required: false,
      type: ApplicationCommandOptionType.Number,
    })
    n: number = 0,
    interaction: CommandInteraction
  ) {
    await interaction.deferReply();
    const args = username.split("#");
    const qid = () => {
      return 
    }
    const em = await valorant
      .getPlayerPuuid(args[0], args[1])
      .then(async (_) => {
        let mid = await valorant.getLastNMatchID(_, n, await axios.get(`https://valorant-api.com/v1/gamemodes/${}`));
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
