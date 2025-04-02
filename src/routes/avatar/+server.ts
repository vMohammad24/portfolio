import { lanyardStore } from '$lib/states/lanyard';
import type { LanyardResponse } from '$lib/types/landyard';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
    const response = await fetch('https://lanyard.vmohammad.dev/v1/users/921098159348924457', {
        headers: {
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        return new Response(null, { status: 500 });
    }

    const data = (await response.json()).data as LanyardResponse;
    lanyardStore.set(data);
    console.log(data);
    const avatar = `https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.webp?size=1024`;
    const buffer = await fetch(avatar).then(res => res.arrayBuffer());
    const blob = new File([buffer], 'avatar.webp', { type: 'image/webp' });
    return new Response(blob);
};