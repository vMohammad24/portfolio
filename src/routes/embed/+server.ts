import { birthday, languages, skills, themeColors } from '$lib/data/constants';
import { fetchLanyard } from '$lib/states/lanyard';
import { Resvg } from '@resvg/resvg-js';
import type { RequestHandler } from '@sveltejs/kit';

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
        const lanyardData = await fetchLanyard();

        const discordUser = lanyardData.discord_user;
        const activities = lanyardData.activities || [];
        const customStatus = activities.find(activity => activity.type === 4);
        const regularActivities = activities.filter(activity => activity.type !== 4);

        const avatar = await toBase64(`https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=1024`);

        let statusColor = themeColors.secondary;
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


        const svgContent = `
        <svg width="800" height="400" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <defs>
                <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="${themeColors.crust}" />
                    <stop offset="50%" stop-color="${themeColors.primary}" />
                    <stop offset="100%" stop-color="${themeColors.background}" />
                </linearGradient>

                <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="${themeColors.blue}" />
                    <stop offset="50%" stop-color="${themeColors.cyan}" />
                    <stop offset="100%" stop-color="${themeColors.purple}" />
                </linearGradient>

                <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="${themeColors.text}" />
                    <stop offset="100%" stop-color="${themeColors.border}" />
                </linearGradient>
                
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#000000" flood-opacity="0.3" />
                </filter>

                <filter id="textShadow" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.4" />
                </filter>

                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
                
                <clipPath id="avatarClip">
                    <circle cx="50" cy="50" r="50" />
                </clipPath>
                
                <clipPath id="progressClip">
                    <rect x="0" y="0" width="100%" height="100%" rx="5" ry="5" />
                </clipPath>
            </defs>
            
            <rect width="800" height="400" rx="20" fill="url(#cardGradient)" filter="url(#shadow)" />

            <circle cx="720" cy="80" r="180" fill="${themeColors.blue}" opacity="0.08">
                <animate attributeName="r" values="180;200;180" dur="8s" repeatCount="indefinite" />
            </circle>
            <circle cx="100" cy="320" r="120" fill="${themeColors.purple}" opacity="0.06">
                <animate attributeName="r" values="120;140;120" dur="6s" repeatCount="indefinite" />
            </circle>
            <circle cx="650" cy="350" r="80" fill="${themeColors.orange}" opacity="0.04">
                <animate attributeName="r" values="80;100;80" dur="10s" repeatCount="indefinite" />
            </circle>
        
            
            <g transform="translate(40, 40)" filter="url(#shadow)">
                <circle cx="50" cy="50" r="54" fill="url(#accentGradient)" filter="url(#glow)">
                    <animate attributeName="r" values="54;56;54" dur="6s" repeatCount="indefinite" />
                </circle>
                <circle cx="50" cy="50" r="51" fill="${themeColors.crust}" opacity="0.9" />
                <image href="${avatar}" x="0" y="0" width="100" height="100" clip-path="url(#avatarClip)">
                    <animate attributeName="opacity" values="0.95;1;0.95" dur="4s" repeatCount="indefinite" />
                </image>

                <circle cx="88" cy="83" r="14" fill="${themeColors.crust}" stroke="url(#accentGradient)" stroke-width="3" />
                <circle cx="88" cy="83" r="9" fill="${statusColor}" filter="url(#glow)">
                    <animate attributeName="r" values="9;8;9" dur="3s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite" />
                </circle>
                
                <g transform="translate(120, 30)">
                    <text font-family="'Segoe UI', system-ui, sans-serif" font-size="32" font-weight="bold" fill="url(#textGradient)" filter="url(#textShadow)">
                        Mohammad
                    </text>

                    <text y="35" font-family="'Segoe UI', system-ui, sans-serif" font-size="18" fill="${themeColors.border}" filter="url(#textShadow)">
                        ${age} years old
                    </text>

                    ${customStatus ? `
                    <text y="60" font-family="'Segoe UI', system-ui, sans-serif" font-size="16" fill="${themeColors.purple}" filter="url(#glow)">
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
                        <rect x="100" y="8" width="200" height="10" rx="5" fill="${themeColors.secondary}" opacity="0.4" />
                        <rect x="100" y="8" width="${lang.proficiency * 2}" height="10" rx="5" fill="${lang.color}">
                            <animate attributeName="width" from="0" to="${lang.proficiency * 2}" dur="1.5s" begin="0s" fill="freeze" />
                        </rect>
                        <text x="${310}" y="16" font-family="'Segoe UI', system-ui, sans-serif" font-size="12" fill="${themeColors.text}">${lang.proficiency}%</text>
                    </g>`).join('')}
                </g>

                <g transform="translate(0, ${140 + (languages.length > 3 ? 0 : (3 - languages.length) * 12)})">
                    <text font-family="'Segoe UI', system-ui, sans-serif" font-size="14" font-weight="bold" fill="${themeColors.border}" filter="url(#textShadow)">
                        Skills
                    </text>
                    
                    <g transform="translate(0, 30)">
                        ${(await Promise.all(skills.slice(0, Math.min(8, Math.floor(380 / 44))).map(async (skill, i) => {
            const skillIconBase64 = await toBase64(skill.icon);
            return `
                            <g transform="translate(${i * 44}, 0)">
                                <circle cx="16" cy="16" r="18" fill="url(#accentGradient)" opacity="0.3" filter="url(#glow)">
                                    <animate attributeName="r" values="18;20;18" dur="${3 + i * 0.3}s" repeatCount="indefinite" />
                                </circle>
                                <circle cx="16" cy="16" r="16" fill="${themeColors.accent}" opacity="0.8" />
                                <image href="${skillIconBase64}" x="4" y="4" height="24" width="24">
                                    <animate attributeName="opacity" values="0.85;1;0.85" dur="${2 + i * 0.5}s" repeatCount="indefinite" />
                                    <animate attributeName="transform" values="scale(1);scale(1.1);scale(1)" dur="${4 + i * 0.2}s" repeatCount="indefinite" />
                                </image>
                            </g>`;
        }))).join('')}
                    </g>
                </g>
            </g>
            
            
            
            <g transform="translate(420, 40)">
                <text font-family="'Segoe UI', system-ui, sans-serif" font-size="20" font-weight="bold" fill="${themeColors.orange}" filter="url(#textShadow)">
                    Current Activity
                </text>
                
                ${regularActivities.length > 0 ?
                (await Promise.all(regularActivities.slice(0, 1).map(async activity => {
                    const activityImage = await toBase64(activity.assets?.large_image);
                    const hasProgress = activity.timestamps?.start && activity.timestamps?.end;
                    const progress = hasProgress ? calculateProgress(activity.timestamps.start, activity.timestamps.end) : 0;

                    return `
                    <g transform="translate(0, 35)" filter="url(#shadow)">
                        <rect width="340" height="${hasProgress ? '110' : '90'}" rx="15" fill="${themeColors.secondary}" opacity="0.2" stroke="url(#accentGradient)" stroke-width="1" />
                        
                        ${activityImage ? `
                        <g transform="translate(20, 20)">
                            <rect width="50" height="50" rx="8" fill="${themeColors.secondary}" />
                            <image href="${activityImage}" x="0" y="0" width="50" height="50" preserveAspectRatio="xMidYMid slice" clip-path="inset(0 0 0 0 round 8px)" />
                        </g>` : ''}
                        
                        <g transform="translate(${activityImage ? '85' : '20'}, 20)">
                            <text font-family="'Segoe UI', system-ui, sans-serif" font-size="16" font-weight="bold" fill="${themeColors.text}">
                                ${activity.name}
                            </text>
                            
                            ${activity.details ? `
                            <text y="25" font-family="'Segoe UI', system-ui, sans-serif" font-size="14" fill="${themeColors.border}">
                                ${activity.details}
                            </text>` : ''}
                            
                            ${activity.state ? `
                            <text y="45" font-family="'Segoe UI', system-ui, sans-serif" font-size="12" fill="${themeColors.gray}">
                                ${activity.state}
                            </text>` : ''}
                            
                            ${hasProgress ? `
                            <g transform="translate(0, 60)">
                                <rect width="230" height="8" rx="4" fill="${themeColors.secondary}" opacity="0.4" />
                                <rect width="${(progress / 100) * 230}" height="8" rx="4" fill="${themeColors.orange}">
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
                `<g transform="translate(0, 35)">
                    <rect width="340" height="70" rx="15" fill="${themeColors.secondary}" opacity="0.2" stroke="url(#accentGradient)" stroke-width="1" />
                    <g transform="translate(20, 35)">
                        <text font-family="'Segoe UI', system-ui, sans-serif" font-size="16" fill="${themeColors.border}" filter="url(#textShadow)">
                            Not doing anything special right now
                        </text>
                    </g>
                 </g>`
            }
            </g>
        </svg>`;

        const buf = new Resvg(svgContent, {
            fitTo: {
                mode: 'height',
                value: 1440
            },
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