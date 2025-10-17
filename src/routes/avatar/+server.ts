import { fetchLanyard } from '$lib/states/lanyard';
import type { RequestHandler } from './$types';

let lastGeneratedTime = 0;
let cachedImageBuffer: Buffer | null = null;
let cachedETag = '';

export const GET: RequestHandler = async ({ request }) => {
    const now = Date.now();
    const ifNoneMatch = request.headers.get('If-None-Match');
    if (now - lastGeneratedTime > 60000 || !cachedImageBuffer) {
        const lanyardData = await fetchLanyard();
        const discordUser = lanyardData.discord_user;
        const avatar = discordUser.avatar ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=1024` : 'https://cdn.discordapp.com/embed/avatars/0.png';

        const buf = await fetch(avatar).catch(e => console.error(`Failed to load image: `, e)).then(res => res ? res.arrayBuffer() : null).then(ab => ab ? Buffer.from(ab) : null);
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

    if (cachedImageBuffer) {
        return new Response(Buffer.from(cachedImageBuffer), {
            headers: {
                'Content-Type': 'image/png',
                'Cache-Control': 'public, max-age=60',
                'ETag': cachedETag
            }
        });
    } else {
        return new Response('Failed to load avatar image', { status: 500 });
    }
};