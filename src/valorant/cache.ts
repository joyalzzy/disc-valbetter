import { PermissionsBitField, Utils } from "discord.js";
import { ValUser } from "./user";
import { getPlayerPuuid } from "./utils";
import { Auth } from "./auth";
import { Cache } from "file-system-cache";
import 'dotenv/config';
import { json } from "stream/consumers";

export class ValCache {
    cache = new Cache;
    async setPuuid(user: string, tag: string, puuid: string) {
        this.cache.get('puuids').then(res => {
            const x = JSON.parse(res ?? '{}')
            x[`${user}#${tag}`] = puuid
            // console.log(x)
            return this.cache.set('puuids', JSON.stringify(x))
        })
    }
    async getPuuid(user: string, tag: string) {
        return this.cache.get('puuids').then(res => {
            return JSON.parse(res)[`${user}#${tag}`] ?? 0
        }
        )
    }
}