import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import { TwitchAuthResponse, TwitchStreamResponse } from './interfaces'
import { streamers } from './streamers';
import { TextChannel } from 'discord.js';

const { discord_token, twitch_client_id, twitch_secret, discord_channel_ids } = require('./config.json');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.login(discord_token)

const getTwitchOath = async (): Promise<string> => {
    const res = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${twitch_client_id}&client_secret=${twitch_secret}&grant_type=client_credentials`, {
        method: 'POST'
    })
    const jsonRes = await res.json() as TwitchAuthResponse
    return jsonRes.access_token
}
const getStreamInfo = async (streamer: string): Promise<TwitchStreamResponse>  => {
    const res = await fetch(`https://api.twitch.tv/helix/streams?client_id=${twitch_client_id}&user_login=${streamer}`, {
        headers: {
            'Authorization': `Bearer ${await getTwitchOath()}`,
            'Client-Id': twitch_client_id
        }
    })
    return await res.json() as TwitchStreamResponse
}  

const isStreamLive = (streamInfo: TwitchStreamResponse): boolean => {
    return streamInfo.data.length > 0
}

interface History {
    [key: string]: boolean
}
const history: History = {}

const checkStreamers = async () => {
    console.log('polling streamers...')
    for (const streamer of streamers) {
        const streamInfo = await getStreamInfo(streamer)
        if (isStreamLive(streamInfo)) {
            if (history[streamer] !== true) {
                alertChannels(streamer, streamInfo)
            }
            history[streamer] = true
        } else {
            history[streamer] = false
        }
    }
}

const alertChannels = async (streamer: string, streamInfo: TwitchStreamResponse) => {
    const channelIds: Array<string> = discord_channel_ids
    for (const channelId of channelIds) {
        const channel = client.channels.cache.get(channelId) as TextChannel
        channel.send(`@here ${streamer} is live!\n${streamInfo.data[0].title}\nhttps://twitch.tv/${streamer}\n`)
        console.log(`channel ${channelId} alerted for ${streamer}`)
    }
    return
}
setInterval(checkStreamers, 15000) // 60000 milliseconds = 1 minute
