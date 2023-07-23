import { CommandInteraction } from "discord.js";
import { Discord, Slash, SlashGroup } from "discordx";
import { valorant } from "../main";
import { nOption, queueOption, usernameOption } from "../utils/commonOptions";

@Discord()
@SlashGroup({ description: "valorant last stats", name: "last" })
@SlashGroup("last")
export class ValorantStatsCommands {
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
