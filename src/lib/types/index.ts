// GITHUB
export type Level = 0 | 1 | 2 | 3 | 4;
export type Year = number | 'lastYear';

export interface Contribution {
    date: string;
    count: number;
    level: Level;
}

export interface GHResponse {
    total: {
        [year: number]: number;
        [year: string]: number; // 'lastYear'
    };
    contributions: Array<Contribution>;
}

export interface NestedResponse {
    total: {
        [year: number]: number;
        [year: string]: number; // 'lastYear'
    };
    contributions: {
        [year: number]: {
            [month: number]: {
                [day: number]: Contribution;
            };
        };
    };
}

export type GitHubContributions = NestedResponse;

export interface ParsedQuery {
    years: Array<number>;
    fetchAll: boolean;
    lastYear: boolean;
    format: 'nested';
}

// WAKATIME

export interface WakaTimeLanguage {
    digital: string;
    hours: number;
    minutes: number;
    name: string;
    percent: number;
    seconds: number;
    text: string;
    total_seconds: number;
    color?: string;
}

export interface WakaTimeProject {
    digital: string;
    hours: number;
    minutes: number;
    name: string;
    percent: number;
    seconds: number;
    text: string;
    total_seconds: number;
}

export interface WakaTimeCategory {
    digital: string;
    hours: number;
    minutes: number;
    name: string;
    percent: number;
    seconds: number;
    text: string;
    total_seconds: number;
}

export interface WakaTimeStats {
    data: {
        username: string;
        user_id: string;
        start: string;
        end: string;
        status: string;
        total_seconds: number;
        daily_average: number;
        days_including_holidays: number;
        range: string;
        human_readable_range: string;
        human_readable_total: string;
        human_readable_daily_average: string;
        is_coding_activity_visible: boolean;
        is_other_usage_visible: boolean;
        languages: Array<WakaTimeLanguage>;
        projects: Array<WakaTimeProject>;
        operating_systems: Array<unknown>;
        categories: Array<WakaTimeCategory>;
        machines: Array<unknown>;
        editors: Array<unknown>;
    };
}

export interface ChartSegment {
    name: string;
    percent: number;
    color: string;
    text: string;
    total_seconds: number;
}

export interface ChartData {
    segments: ChartSegment[];
    totalTime: string;
    total_seconds: number;
}


// LANYARD


export interface KV {
    [key: string]: string;
}

export interface Timestamps {
    start: number;
    end: number;
}

export interface Spotify {
    track_id: string;
    timestamps: Timestamps;
    song: string;
    artist: string;
    album_art_url: string;
    album: string;
}

export interface AvatarDecorationData {
    sku_id: string;
    asset: string;
}

export interface DiscordUser {
    username: string;
    public_flags: number;
    id: string;
    discriminator: string;
    avatar: string;
    avatar_decoration_data?: AvatarDecorationData;
}

export interface Party {
    id: string;
}

export interface Assets {
    large_text: string;
    large_image: string;
}

export interface Activity {
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

// LYRICS API

export interface EnhancedLyricsResponse {
    lines: EnhancedLyric[];
}


interface EnhancedLyric {
    time: number;
    text: string;
    words: {
        time: number;
        word: string;
        endTime: number;
        isParenthetical: boolean;
        confidence: null;
        syllableCount: number;
        characters: Character[];
    }[];
    confidence: number | null;
    characters: Character[];
}

interface Character {
    time: number;
    char: string;
    endTime: number;
    isVowel: boolean;
    isSilent: boolean;
    confidence: number | null;
    phoneme: string;
}




// PROJECT


export interface ProjectData {
    name: string;
    description: string;
    link: string;
    logo?: string;
    wakatimeName?: string;
    wakatimeStats?: {
        totalSeconds: number;
        text: string;
        percent: number;
    } | null; techs?: string[];
}


// CONSTANTS


export const languageColors: Record<string, string> = {
    TypeScript: '#3178C6',
    TSX: '#3178C6',
    JavaScript: '#F7DF1E',
    Python: '#3776AB',
    Svelte: '#FF3E00',
    Rust: '#DEA584',
    Go: '#00ADD8',
    HTML: '#E34F26',
    CSS: '#1572B6',
    JSON: '#292929',
    YAML: '#CB171E',
    Java: '#ED8B00',
};