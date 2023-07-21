import { CommandInteraction } from "discord.js";

const queueids = new Map<string[], string>([
  [["competitive", "ranked", "comps", "comp"], "competitive"],
  [["custom"], "custom"],
  [["deathmatch", "dm"], "deathmatch"],
  [["escalation", "esc"], "ggteam"],
  [["team deathmatch", "tdm", "team"], "hurm"],
  [["lotus", "newmap"], "newmap"],
  [["replication", "repli", "replic"], "onefa"],
  [["premier"], "premier"],
  [["snowball"], "snowball"],
  [["spikerush", "spike"], "spikerush"],
  [["swiftplay", "swift"], "swiftplay"],
  [["unrated"], "unrated"],
]);
//   Add more mappings if needed
// };
export const parseQID = (a: string) => {
  return queueids.get([...queueids.keys()].find((x: string[]) => {
    return x.indexOf(a) !== -1 
  }) ?? [])
};

