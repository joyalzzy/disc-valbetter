import * as fs from "fs";
// import services from "../data/v1/services.json";
// import { ButtonStyle } from 'discord.js';
import stops from "../data/v1/stops.json" assert { type: "json" };
import {binarySearchRange} from "../utils/search.js"

export default class Bus {
  /// auto copmlete for disscord
  busalpha: Bus.Stops[];
  constructor() {}
  getStopAutocomplete() {}
  getBusAutocomplete() {}
  /// get Bus list

  // settlign data
}

export namespace Bus {
  export interface Stops {
    id: string;
    lat: number;
    long: number;
    name: string;
    street: string;
  }
}

export function fixdata() {
  let stoplist: Bus.Stops[] = [];
  let s: { [id: string]: [number, number, string, string] } =
    Object.assign(stops);
  Object.keys(s).forEach((id) => {
    stoplist.push({
      id: id,
      lat: s[id][1],
      long: s[id][0],
      name: s[id][2].trim(),
      street: s[id][3],
    });
  });
  fs.writeFileSync(
    "src/data/good-bus.json",
    JSON.stringify(
      stoplist.sort((a, b) =>
        a.name.toLocaleLowerCase() > b.name.toLocaleLowerCase() ? 1 : -1
      )
    )
  );
  return stoplist

}
export function getAutocompleteSuggestions(sortedList: Bus.Stops[], input: string): any[] { const [start, end] = binarySearchRange(sortedList, input.toLowerCase());
  if (start === -1 || end === -1) {
    return [];
  }

  return sortedList.slice(start, end + 1).map((a) => {
      return {name: a.name, value: a.id}
  });
}