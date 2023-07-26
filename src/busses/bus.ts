import * as fs from "fs";
import stopsDataJSON from "../data/stops.json" assert { type: "json" };
// import { ButtonStyle } from 'discord.js';
import stops from "../data/v1/stops.json" assert { type: "json" };
import { binarySearchRange } from "../utils/search.js";

// const stopInfos = require('')
export default class Bus {
  /// auto copmlete for disscord
  busalpha: Bus.Stops[];
  constructor() {}
  getStopAutocomplete() {}
  getBusAutocomplete() {}
  /// get Bus list

  // settlign data
}

export declare namespace Bus {
  export interface Stops {
    id: string;
    lat: number;
    long: number;
    name: string;
    street: string;
  }
  export interface Service {
    ServiceNo: string;
    Operator: string;
    NextBus: NextBus;
    NextBus2: NextBus;
    NextBus3: NextBus;
  }
  export interface NextBus {
    OriginCode: string;
    DestinationCode: string;
    EstimatedArrival: string;
    Latitude: string;
    Longitude: string;
    VisitNumber: string;
    Load: string;
    Feature: string;
    Type: string;
  }
}

export async function getBusArrival(id: string, bus?: string) {
  return (<Bus.Service>await reqArrivals(id, bus)).NextBus;
}
export async function parseAllServicesCommandEmbed(id: string) {
  let arriv: Bus.Service[] = await reqArrivals(id);
  return new EmbedBuilder().addFields(
    await Promise.all(
      arriv.map((x) => {
        return { name: x.ServiceNo, value: x.NextBus.EstimatedArrival, inline: true };
      })
    )
  );
}
async function reqArrivals(id: string, bus?: string) {
  return (
    await axios.get(
      `http://datamall2.mytransport.sg/ltaodataservice/BusArrivalv2?BusStopCode=${id}${
        bus ? "&ServiceNo" + bus : ""
      }`,
      {
        headers: {
          AccountKey: process.env.DATAMALL_API,
          accept: "application/json",
        },
      }
    )
  ).data.Services;
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
  return stoplist;
}
export function getAutocompleteSuggestions(
  sortedList: Bus.Stops[],
  input: string
): any[] {
  const [start, end] = binarySearchRange(sortedList, input.toLowerCase());
  if (start === -1 || end === -1) {
    return [];
  }

  return sortedList.slice(start, end + 1).map((a) => {
    return { name: a.name, value: [a.name, a.id].join(",") };
  });
}
/// gets bus stop info
export function getStopInfo(id: string) {
  return stopsDataJSON.features.find((x) => x.id == id)?.properties;
}
import sortedStopse from "../data/good-bus.json" assert { type: "json" };
import { assert } from "console";
import { type } from "os";
import axios from "axios";
import { NameServiceResponse } from "valorant-api-types";
import { Embed, EmbedBuilder } from "discord.js";
export const sortedStops = sortedStopse;
