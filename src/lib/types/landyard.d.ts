interface KV {
    [key: string]: string;
}

interface Timestamps {
    start: number;
    end: number;
}

interface Spotify {
    track_id: string;
    timestamps: Timestamps;
    song: string;
    artist: string;
    album_art_url: string;
    album: string;
}

interface DiscordUser {
    username: string;
    public_flags: number;
    id: string;
    discriminator: string;
    avatar: string;
    avatar_decoration_data?: AvatarDecorationData;
}

interface AvatarDecorationData {
    sku_id: string;
    asset: string;
}

interface Party {
    id: string;
}

interface Assets {
    large_text: string;
    large_image: string;
}

interface Activity {
    application_id: string;
    type: number;
    timestamps: Timestamps;
    sync_id: string;
    state: string;
    session_id: string;
    party: Party;
    name: string;
    id: string;
    flags: number;
    details: string;
    created_at: number;
    assets: Assets;
}

export interface LanyardResponse {
    active_on_discord_mobile: boolean;
    active_on_discord_desktop: boolean;
    listening_to_spotify: boolean;
    kv: KV;
    spotify: Spotify;
    discord_user: DiscordUser;
    discord_status: string;
    activities: Activity[];
}


