export type WakaTimeStats = {
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
        languages: Array<{
            digital: string;
            hours: number;
            minutes: number;
            name: string;
            percent: number;
            seconds: number;
            text: string;
            total_seconds: number;
            color?: string;
        }>;
        projects: Array<{
            digital: string;
            hours: number;
            minutes: number;
            name: string;
            percent: number;
            seconds: number;
            text: string;
            total_seconds: number;
        }>;
        operating_systems: Array<unknown>;
        categories: Array<{
            digital: string;
            hours: number;
            minutes: number;
            name: string;
            percent: number;
            seconds: number;
            text: string;
            total_seconds: number;
        }>;
        machines: Array<unknown>;
        editors: Array<unknown>;
    };
};

export async function fetchWakaTimeStats(): Promise<WakaTimeStats> {
    const response = await fetch("https://wakatime.vmohammad.dev");

    if (!response.ok) {
        throw new Error(`Error fetching WakaTime stats: ${response.statusText}`);
    }

    return await response.json();
}

export function extractProjectStats(wakaTimeData: WakaTimeStats, projectNames: string[]): Record<string, {
    totalSeconds: number;
    text: string;
    percent: number;
} | null> {
    if (!wakaTimeData?.data?.projects) {
        return {};
    }

    const result: Record<string, {
        totalSeconds: number;
        text: string;
        percent: number;
    } | null> = {};

    const lowercaseProjectNames = projectNames.map(name => name.toLowerCase());

    const projectMap = new Map(
        wakaTimeData.data.projects.map(project => [project.name.toLowerCase(), project])
    );

    lowercaseProjectNames.forEach((lowercaseName, index) => {
        const originalName = projectNames[index];
        const project = projectMap.get(lowercaseName);

        if (project) {
            result[originalName] = {
                totalSeconds: project.total_seconds,
                text: project.text,
                percent: project.percent
            };
        } else {
            result[originalName] = null;
        }
    });

    return result;
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
    TSX: '#3178C6',
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

export function prepareChartData(languages: WakaTimeStats['data']['languages']) {
    const sortedLanguages = [...languages].sort((a, b) => b.percent - a.percent);

    const totalSeconds = sortedLanguages.reduce((total, lang) => total + lang.total_seconds, 0);
    let totalTime = '';

    if (totalSeconds > 3600) {
        totalTime = `${Math.floor(totalSeconds / 3600)}h ${Math.floor((totalSeconds % 3600) / 60)}m`;
    } else {
        totalTime = `${Math.floor(totalSeconds / 60)}m`;
    }
    const limit = 10;
    const topLanguages = sortedLanguages.slice(0, limit);

    if (sortedLanguages.length > limit) {
        const otherSeconds = sortedLanguages
            .slice(limit)
            .reduce((total, lang) => total + lang.total_seconds, 0);

        const otherPercent = sortedLanguages
            .slice(limit)
            .reduce((total, lang) => total + lang.percent, 0);

        let otherText = '';
        if (otherSeconds > 3600) {
            otherText = `${Math.floor(otherSeconds / 3600)}h ${Math.floor((otherSeconds % 3600) / 60)}m`;
        } else {
            otherText = `${Math.floor(otherSeconds / 60)}m`;
        }

        topLanguages.push({
            name: 'Other',
            total_seconds: otherSeconds,
            percent: otherPercent,
            text: otherText,
            color: '#CCCCCC',
            digital: '',
            hours: Math.floor(otherSeconds / 3600),
            minutes: Math.floor((otherSeconds % 3600) / 60),
            seconds: otherSeconds % 60
        });
    }
    for (const lang of topLanguages) {
        if (!lang.color) {
            lang.color = languageColors[lang.name] || '#CCCCCC';
        }
    }
    return {
        segments: topLanguages,
        totalTime
    };
}
