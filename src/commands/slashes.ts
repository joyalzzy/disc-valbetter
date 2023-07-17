import { Pagination } from "@discordx/pagination";
import { CommandInteraction, User } from "discord.js";
import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { Discord, MetadataStorage, Slash, SlashOption } from "discordx";
import { ValCache } from "../valorant/cache";
import { ValUser } from "../valorant/user";
import { Match } from "../valorant/match";
import { getPlayerKillsfromMatchResposne } from "../valorant/utils";

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
    const user = new ValUser();
    const cache = new ValCache();

    await cache.ready
      .then((_) => {
        return cache.setPuuid(
          "",
          "",
          ""
        );
      }).then(() => {
        return cache.getPuuid("", "");
      })
      .then((_) => {
        console.log(_);
        return user.createVal(
          process.env.VAL_USER || "",
          process.env.VAL_PASS || ""
        );
      });
    const match = new Match();
    
    const puuid = await cache.getPuuid(...(username.split('#') as [string, string]));
    const kills = await match
      .getLastMatchID(user.auth.ax, puuid, user.auth)
      .then((_) => {
        return match.getMatchInfo(user.auth.ax, user.auth, _);
      })
      .then((_) => {
        return getPlayerKillsfromMatchResposne(_.data, puuid);
      });

    await interaction.reply(String(kills))
  }
}
