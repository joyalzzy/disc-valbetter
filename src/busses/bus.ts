import * as fs from "fs";
import stopsDataJSON from "../data/stops.json" assert { type: "json" };
// import { ButtonStyle } from 'discord.js';
import stops from "../data/v1/stops.json" assert { type: "json" };
import { binarySearchRange } from "./search.js";
import sortedStopse from "../data/good-bus.json" assert { type: "json" };
import axios from "axios";
import { AttachmentBuilder, EmbedBuilder } from "discord.js";
import { getTrafficMap } from "../maps/map.js";
import { Service, Stops, TrafficIncidentsResponse } from "../types/lta.js";

// const stopInfos = require('')




export async function getBusArrival(id: string, bus?: string) {
  return (<Service>await reqArrivals(id, bus)).NextBus;
}
export async function getOverviewResponse() {
  const road = await getRoadInfo();
  const map = await getTrafficMap(
    road.value
      .filter((x) => x.Type != "Roadwork")
      .map((x) => {
        return [x.Longitude, x.Latitude];
      })
  );
  // fs.writeFileSync("assets/img.jpg", map);
  return {
    embeds: [
      new EmbedBuilder()
        .setTitle("Overview at " + new Date().toTimeString())
        .addFields({
          name: "Traffic incidents",
          value: road.value
            .filter((x) => x.Type != "Roadwork")
            .map((x) => {
              return x.Message.match(" (.*)$")![0] ?? "";
            })
            .join("\n")
            .slice(0, 1000),
        })
        .setImage("attachment://traffic.jpg"),
    ],
    files: [new AttachmentBuilder(map, { name: "traffic.jpg" })],
  };
}
export async function parseAllServicesCommandEmbed(id: string) {
  let arriv: Service[] = await reqArrivals(id);
  return new EmbedBuilder()
    .addFields(
      await Promise.all(
        arriv.map((x) => {
          return {
            name: x.ServiceNo,
            value: ((value: number) => {
              return value >= 0 ? (value / 60000).toPrecision(3) : "Now";
            })(
              new Date(x.NextBus.EstimatedArrival).valueOf() -
                new Date().valueOf()
            ).toString(),
            inline: true,
          };
        })
      )
    )
    .setFooter({ text: "in minutes" });
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
          "Cache-Control":
            "no-store, no-cache, max-age=0, must-revalidate, proxy-revalidate",
        },
      }
    )
  ).data.Services;
}
export function fixdata() {
  let stoplist: Stops[] = [];
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
  sortedList: Stops[],
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
export async function getRoadInfo() {
  return <TrafficIncidentsResponse>(
    await axios.get(
      "http://datamall2.mytransport.sg/ltaodataservice/TrafficIncidents",
      {
        headers: {
          AccountKey: process.env.DATAMALL_API,
          accept: "application/json",
          "Cache-Control":
            "no-store, no-cache, max-age=0, must-revalidate, proxy-revalidate",
        },
      }
    )
  ).data;
}
export const sortedStops = sortedStopse;
