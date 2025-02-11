interface WakaTimeActivity {
    decimal: string;
    digital: string;
    hours: number;
    minutes: number;
    name: string;
    percent: number;
    text: string;
    total_seconds: number;
}

export interface WakaTimeStats {
    categories: WakaTimeActivity[];
    daily_average: number;
    daily_average_including_other_language: number;
    days_including_holidays: number;
    days_minus_holidays: number;
    editors: WakaTimeActivity[];
    holidays: number;
    human_readable_daily_average: string;
    human_readable_daily_average_including_other_language: string;
    human_readable_range: string;
    human_readable_total: string;
    human_readable_total_including_other_language: string;
    id: string;
    is_already_updating: boolean;
    is_cached: boolean;
    is_category_usage_visible: boolean;
    is_coding_activity_visible: boolean;
    is_editor_usage_visible: boolean;
    is_including_today: boolean;
    is_language_usage_visible: boolean;
    is_os_usage_visible: boolean;
    is_stuck: boolean;
    is_up_to_date: boolean;
    is_up_to_date_pending_future: boolean;
    languages: WakaTimeActivity[];
    operating_systems: WakaTimeActivity[];
    percent_calculated: number;
    range: string;
    status: string;
    timeout: number;
    total_seconds: number;
    total_seconds_including_other_language: number;
    user_id: string;
    username: string;
    writes_only: boolean;
}

interface WakaTimeResponse {
    data: WakaTimeStats;
}

export async function fetchWakaTimeStats(): Promise<WakaTimeStats> {
    const response = await fetch(
        'https://wakatime.vmohammad.dev/',
    );
    const data: WakaTimeResponse = await response.json();
    return data.data;
}

export function filterSignificantLanguages(languages: WakaTimeActivity[], threshold = 1): WakaTimeActivity[] {
    return languages.filter(lang => lang.percent >= threshold);
}

export function calculateTotalHours(stats: WakaTimeStats): number {
    return stats.total_seconds / 3600;
}

export function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours === 0) {
        return `${minutes}m`;
    }
    return `${hours}h ${minutes}m`;
}

export interface ChartSegment {
    name: string;
    percent: number;
    color: string;
    timeSpent: string;
    total_seconds: number;
}

export interface ChartData {
    segments: ChartSegment[];
    totalTime: string;
    total_seconds: number;
}

export const languageColors: Record<string, string> = {
    TypeScript: '#3178C6',
    JavaScript: '#F7DF1E',
    Python: '#3776AB',
    Svelte: '#FF3E00',
    Rust: '#DEA584',
    Go: '#00ADD8',
    HTML: '#E34F26',
    CSS: '#1572B6',
    JSON: '#292929',
    YAML: '#CB171E'
};

export function prepareChartData(languages: WakaTimeActivity[]): ChartData {
    const significant = filterSignificantLanguages(languages, 1);
    const total_seconds = languages.reduce((acc, lang) => acc + lang.total_seconds, 0);

    return {
        segments: significant.map(lang => ({
            name: lang.name,
            percent: lang.percent,
            color: languageColors[lang.name] || '#666666',
            timeSpent: formatTime(lang.total_seconds),
            total_seconds: lang.total_seconds
        })),
        totalTime: formatTime(total_seconds),
        total_seconds
    };
}
