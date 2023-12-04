export interface TwitchAuthResponse {
    access_token: string,
    expires_in: number,
    token_type: string
}

export interface TwitchStreamResponse {
    data: TwitchStreamData[],
    pagination: {
        cursor: string
    }
}

interface TwitchStreamData {
    id: string,
    user_id: string,
    user_name: string,
    game_id: string,
    type: string,
    title: string,
    viewer_count: number,
    started_at: string,
    language: string,
    thumbnail_url: string
}