import axios from "axios";
import * as fs from "fs";
import { PassThrough } from "node:stream";
import { writer } from "repl";

export async function getTrafficMap(
  points: [number, number][]
): Promise<Buffer> {
  // long, lat
  //   let write = createWriteStream("assets/img.jpg");
  let transposedArray = points[0].map((_, colIndex) =>
    points.map((row) => row[colIndex])
  );
  let url = `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/${points
    .map((x) => {
      return `pin-s+555555(${x[0]},${x[1]})`;
    })
    .join(",")}/[${Math.min(...transposedArray[0]) - 0.01},${
    Math.min(...transposedArray[1]) - 0.01
  },${Math.max(...transposedArray[0]) + 0.01},${
    Math.max(...transposedArray[1]) + 0.01
  }]/1080x720@2x?access_token=${process.env.MAPBOX_TOKEN}`;
  return await axios
    .get(url, { responseType: "arraybuffer" })
    .then(async (a) => {
      // return (
      //   await Promise.all(a.data.pipe(new PassThrough({ encoding: "base64" })))
      // ).join(""
      let base64 = Buffer.from(a.data, "binary");


      // actual image
      return base64
    });
}
