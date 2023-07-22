import { Discord, Slash, SlashGroup } from "discordx";
import { valorant } from "../main";
import { CommandInteraction } from "discord.js";

@Discord()
@SlashGroup({ description: "admin commands", name: "admin" })
@SlashGroup('admin')
export class AdminCommands {
  @Slash({
    description: 'refresh token',
    name: 'refresh'
  })
  async refreshToken(interaction: CommandInteraction) {
     interaction.reply((await valorant.refreshToken()) ? 'ok' : 'not ok')
  }
}

