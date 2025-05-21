import { type WakaTimeStats, fetchWakaTimeStats } from '$lib/client/wakatime';
import { birthday, languages, skills, themeColors } from '$lib/data/constants';
import { fetchLanyard } from '$lib/states/lanyard';
import { Resvg } from '@resvg/resvg-js';
import type { RequestHandler } from './$types';

let lastGeneratedTime = 0;
let cachedImageBuffer: Buffer | null = null;
let cachedETag = '';

const cache = new Map<string, string>();
async function toBase64(imageUrl: string) {
    if (cache.has(imageUrl)) {
        return cache.get(imageUrl)!;
    }
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const base64 = Buffer.from(await blob.arrayBuffer()).toString('base64');
    const url = `data:${blob.type};base64,${base64}`;
    cache.set(imageUrl, url);
    return url;
}
export const GET: RequestHandler = async ({ request }) => {
    const now = Date.now();
    const ifNoneMatch = request.headers.get('If-None-Match');
    if (now - lastGeneratedTime > 60000 || !cachedImageBuffer) {
        const [lanyardData, wakaTimeData] = await Promise.all([
            fetchLanyard(),
            fetchWakaTimeStats().catch(() => null)
        ]);

        const discordUser = lanyardData.discord_user;
        const activities = lanyardData.activities || [];
        const customStatus = activities.find(activity => activity.type === 4);
        const regularActivities = activities.filter(activity => activity.type !== 4);

        const avatar = await toBase64(`https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=1024`);

        let statusColor = themeColors.surface0;
        if (lanyardData.discord_status === 'online') statusColor = themeColors.green;
        else if (lanyardData.discord_status === 'idle') statusColor = themeColors.yellow;
        else if (lanyardData.discord_status === 'dnd') statusColor = themeColors.red;

        const calculateProgress = (start: number, end: number) => {
            const now = Date.now();
            const total = end - start;
            const elapsed = Math.min(now - start, total);
            return Math.max(0, Math.min(100, Math.floor((elapsed / total) * 100)));
        };


        const nowDate = new Date();
        const age = ((nowDate.getTime() - birthday.getTime()) / (1000 * 60 * 60 * 24 * 365.25)).toFixed(2);

        let topProjects: WakaTimeStats['data']['projects'] = [];
        let weeklyTotal = "";

        if (wakaTimeData?.data) {
            topProjects = wakaTimeData.data.projects
                ? wakaTimeData.data.projects
                    .sort((a, b) => b.total_seconds - a.total_seconds)
                    .slice(0, 3)
                : [];

            weeklyTotal = wakaTimeData.data.human_readable_total || "";
        }

        const projectData = topProjects.map((project, index) => {
            const projectColors = [themeColors.mauve, themeColors.blue, themeColors.teal];
            return {
                color: projectColors[index] || themeColors.sapphire,
                percent: project.percent,
                name: project.name,
                value: project.text
            };
        });

        const svgContent = `
        <svg width="800" height="400" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <defs>
                <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="${themeColors.crust}" />
                    <stop offset="100%" stop-color="${themeColors.mantle}" />
                </linearGradient>
                
                <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="${themeColors.blue}" />
                    <stop offset="100%" stop-color="${themeColors.lavender}" />
                </linearGradient>
                
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.2" />
                </filter>
                
                <filter id="textShadow" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#000000" flood-opacity="0.3" />
                </filter>
                
                <clipPath id="avatarClip">
                    <circle cx="50" cy="50" r="50" />
                </clipPath>
                
                <clipPath id="progressClip">
                    <rect x="0" y="0" width="100%" height="100%" rx="5" ry="5" />
                </clipPath>
            </defs>
            
            <rect width="800" height="400" rx="16" fill="url(#cardGradient)" />
            
            <circle cx="720" cy="80" r="200" fill="${themeColors.blue}" opacity="0.05" />
            <circle cx="100" cy="320" r="150" fill="${themeColors.lavender}" opacity="0.05" />
        
            
            <g transform="translate(40, 40)" filter="url(#shadow)">
                <circle cx="50" cy="50" r="52" fill="url(#accentGradient)" />
                <circle cx="50" cy="50" r="50" fill="${themeColors.crust}" opacity="0.8" />
                <image href="${avatar}" x="0" y="0" width="100" height="100" clip-path="url(#avatarClip)">
                    <animate attributeName="opacity" values="0.95;1;0.95" dur="4s" repeatCount="indefinite" />
                </image>
                
                <circle cx="90" cy="85" r="12" fill="${themeColors.crust}" stroke="${themeColors.surface1}" stroke-width="2" />
                <circle cx="90" cy="85" r="8" fill="${statusColor}">
                    <animate attributeName="r" values="8;7;8" dur="3s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite" />
                </circle>
                
                <g transform="translate(120, 30)">
                    <text font-family="'Segoe UI', system-ui, sans-serif" font-size="28" font-weight="bold" fill="${themeColors.text}" filter="url(#textShadow)">
                        Mohammad
                    </text>
                    
                    <text y="30" font-family="'Segoe UI', system-ui, sans-serif" font-size="16" fill="${themeColors.subtext0}">
                        ${age} years old
                    </text>
                    
                    ${customStatus ? `
                    <text y="55" font-family="'Segoe UI', system-ui, sans-serif" font-size="14" fill="${themeColors.lavender}">
                        ${customStatus.state || ''}
                    </text>` : ''}
                </g>
            </g>
            
            <g transform="translate(40, 180)">
                <text font-family="'Segoe UI', system-ui, sans-serif" font-size="16" font-weight="bold" fill="${themeColors.mauve}" filter="url(#textShadow)">
                    Languages
                </text>
                
                <g transform="translate(0, 30)">
                    ${languages.slice(0, 3).map((lang, i) => `
                    <g transform="translate(0, ${i * 36})">
                        <text x="0" y="16" font-family="'Segoe UI', system-ui, sans-serif" font-size="14" fill="${themeColors.text}">${lang.name}</text>
                        <rect x="100" y="8" width="200" height="10" rx="5" fill="${themeColors.surface0}" opacity="0.4" />
                        <rect x="100" y="8" width="${lang.proficiency * 2}" height="10" rx="5" fill="${lang.color}">
                            <animate attributeName="width" from="0" to="${lang.proficiency * 2}" dur="1.5s" begin="0s" fill="freeze" />
                        </rect>
                        <text x="${310}" y="16" font-family="'Segoe UI', system-ui, sans-serif" font-size="12" fill="${themeColors.text}">${lang.proficiency}%</text>
                    </g>`).join('')}
                </g>

                <g transform="translate(0, ${140 + (languages.length > 3 ? 0 : (3 - languages.length) * 12)})">
                    <text font-family="'Segoe UI', system-ui, sans-serif" font-size="14" font-weight="bold" fill="${themeColors.subtext0}" filter="url(#textShadow)">
                        Skills
                    </text>
                    
                    <g transform="translate(0, 30)">
                        ${(await Promise.all(skills.slice(0, Math.min(7, Math.floor(320 / 48))).map(async (skill, i) => {
            const skillIconBase64 = await toBase64(skill.icon);
            return `
                            <g transform="translate(${i * 48}, 0)">
                                <circle cx="16" cy="16" r="16" fill="${themeColors.surface1}" opacity="0.7" />
                                <image href="${skillIconBase64}" x="4" y="4" height="24" width="24">
                                    <animate attributeName="opacity" values="0.85;1;0.85" dur="${2 + i * 0.5}s" repeatCount="indefinite" />
                                </image>
                            </g>`;
        }))).join('')}
                    </g>
                </g>
            </g>
            
            
            <g transform="translate(420, 40)">
                <text font-family="'Segoe UI', system-ui, sans-serif" font-size="16" font-weight="bold" fill="${themeColors.teal}" filter="url(#textShadow)">
                    Coding Stats
                </text>
                
                ${weeklyTotal ? `
                <text y="30" font-family="'Segoe UI', system-ui, sans-serif" font-size="14" fill="${themeColors.text}">
                    ${weeklyTotal} this week
                </text>` : ''}
                
                ${projectData.length > 0 ? `
                <g transform="translate(0, 50)">
                    <rect width="340" height="${projectData.length * 36 + 16}" rx="8" fill="${themeColors.surface0}" opacity="0.1" />
                    
                    ${projectData.map((project, i) => `
                    <g transform="translate(20, ${i * 36 + 24})">
                        <rect width="12" height="12" rx="2" fill="${project.color}" />
                        <text x="24" y="10" font-family="'Segoe UI', system-ui, sans-serif" font-size="14" fill="${themeColors.text}">
                            ${project.name}
                        </text>
                        <text x="300" y="10" text-anchor="end" font-family="'Segoe UI', system-ui, sans-serif" font-size="14" fill="${themeColors.subtext0}">
                            ${project.value}
                        </text>
                    </g>`).join('')}
                </g>` : `
                <g transform="translate(0, 50)">
                    <rect width="340" height="40" rx="8" fill="${themeColors.surface0}" opacity="0.2" />
                    <text x="20" y="25" font-family="'Segoe UI', system-ui, sans-serif" font-size="14" fill="${themeColors.subtext0}">
                        No WakaTime data available
                    </text>
                </g>`}
            </g>
            
            <g transform="translate(420, ${projectData.length > 0 ? Math.max(190, 50 + projectData.length * 44 + 60) : 190})">
                <text font-family="'Segoe UI', system-ui, sans-serif" font-size="16" font-weight="bold" fill="${themeColors.peach}" filter="url(#textShadow)">
                    Current Activity
                </text>
                
                ${regularActivities.length > 0 ?
                (await Promise.all(regularActivities.slice(0, 1).map(async activity => {
                    const activityImage = await toBase64(activity.assets?.large_image);
                    const hasProgress = activity.timestamps?.start && activity.timestamps?.end;
                    const progress = hasProgress ? calculateProgress(activity.timestamps.start, activity.timestamps.end) : 0;

                    return `
                    <g transform="translate(0, 30)" filter="url(#shadow)">
                        <rect width="340" height="${hasProgress ? '100' : '80'}" rx="10" fill="${themeColors.surface0}" opacity="0.15" />
                        
                        ${activityImage ? `
                        <g transform="translate(20, 20)">
                            <rect width="50" height="50" rx="8" fill="${themeColors.surface0}" />
                            <image href="${activityImage}" x="0" y="0" width="50" height="50" preserveAspectRatio="xMidYMid slice" clip-path="inset(0 0 0 0 round 8px)" />
                        </g>` : ''}
                        
                        <g transform="translate(${activityImage ? '85' : '20'}, 20)">
                            <text font-family="'Segoe UI', system-ui, sans-serif" font-size="16" font-weight="bold" fill="${themeColors.text}">
                                ${activity.name}
                            </text>
                            
                            ${activity.details ? `
                            <text y="25" font-family="'Segoe UI', system-ui, sans-serif" font-size="14" fill="${themeColors.subtext0}">
                                ${activity.details}
                            </text>` : ''}
                            
                            ${activity.state ? `
                            <text y="45" font-family="'Segoe UI', system-ui, sans-serif" font-size="12" fill="${themeColors.subtext1}">
                                ${activity.state}
                            </text>` : ''}
                            
                            ${hasProgress ? `
                            <g transform="translate(0, 60)">
                                <rect width="230" height="8" rx="4" fill="${themeColors.surface0}" opacity="0.4" />
                                <rect width="${(progress / 100) * 230}" height="8" rx="4" fill="${themeColors.peach}">
                                    <animate attributeName="width" from="0" to="${(progress / 100) * 230}" dur="1s" begin="0s" fill="freeze" />
                                </rect>
                                <text x="${(progress / 100) * 230 + 10}" y="8" font-family="'Segoe UI', system-ui, sans-serif" font-size="10" fill="${themeColors.text}">
                                    ${progress}%
                                </text>
                            </g>` : ''}
                        </g>
                    </g>`;
                }))).join('')
                :
                `<g transform="translate(0, 30)">
                    <rect width="340" height="60" rx="10" fill="${themeColors.surface0}" opacity="0.15" />
                    <g transform="translate(20, 30)">
                        <text font-family="'Segoe UI', system-ui, sans-serif" font-size="14" fill="${themeColors.subtext0}">
                            Not doing anything special right now
                        </text>
                    </g>
                 </g>`
            }
            </g>
        </svg>`;

        const buf = new Resvg(svgContent, {
            imageRendering: 1,
        }).render().asPng();

        cachedImageBuffer = buf;
        lastGeneratedTime = now;
        cachedETag = `W/"${lastGeneratedTime}-${Math.random().toString(36).substring(2, 10)}"`;
    }

    if (ifNoneMatch === cachedETag) {
        return new Response(null, {
            status: 304,
            headers: {
                'ETag': cachedETag,
                'Cache-Control': 'public, max-age=60'
            }
        });
    }

    return new Response(Buffer.from(cachedImageBuffer), {
        headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=60',
            'ETag': cachedETag
        }
    });
};