import { PermissionsBitField, Utils } from "discord.js";
import { ValUser } from "./user";
import { getPlayerPuuid } from "./utils";
import { Auth } from "./auth";
import { Cache } from "file-system-cache";
import 'dotenv/config';
import { json } from "stream/consumers";

export class ValCache {
    cache = new Cache;
    public ready;
    constructor () {
        this.ready = Promise.resolve(this.cache.get('puuids').then( _ => {return}).catch(_ => {return this.cache.set('puuids', '{}')}))
    }
    async setPuuid(user: string, tag: string, puuid: string) {
        this.cache.get('puuids').then(res => {
            // console.log(res)
            let x = JSON.parse(res ?? '{}')
            // console.log(x)
            x[`${user}#${tag}`] = puuid
            // console.log(x)
            return this.cache.set('puuids', JSON.stringify(x))
        }).catch(err =>  {
            // console.log(err)
        })
    }
    async getPuuid(user: string, tag: string) : Promise<string> {
        return this.cache.get('puuids').then((res) => {
            return JSON.parse(res)[`${user}#${tag}`] ?? 0
        }
        ).catch(err => {
            // console.log(err)
        })
    }
}