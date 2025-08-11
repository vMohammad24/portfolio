import { browser } from '$app/environment';
import { discordId, lanyardDomain } from '$lib/data/constants';
import type { LanyardResponse } from '$lib/types';
import { writable } from 'svelte/store';

const DOMAIN = lanyardDomain;
function formatData(data: LanyardResponse) {
    if (data.activities.length > 0) {
        data.activities = data.activities.map(activity => {
            const appId = activity.application_id;
            let image = activity.assets?.large_image;
            if (!image) return activity;
            if (image.startsWith("mp:external/")) {
                image = `https://${image.split("/").slice(3).join("/")}`;
            } else {
                image = `https://cdn.discordapp.com/app-assets/${appId}/${image}.png`;
            }
            activity.assets.large_image = image;
            return activity;
        })
    }
    return data;
}

export async function fetchLanyard() {
    const res = await fetch(`https://${lanyardDomain}/v1/users/${discordId}`);
    if (!res.ok) {
        throw new Error('Failed to fetch Lanyard data');
    }
    const data = (await res.json()).data as LanyardResponse;
    return formatData(data);
}

const createLanyardStore = () => {
    const { subscribe, set, update } = writable<LanyardResponse | null>(null);

    if (browser) {
        const socket = new WebSocket(`wss://${DOMAIN}/socket`);

        socket.addEventListener('open', () => {
            console.log('Connected to Lanyard WebSocket');
            socket.send(
                JSON.stringify({
                    op: 2,
                    d: {
                        subscribe_to_id: discordId
                    }
                })
            );
        });

        socket.addEventListener('message', ({ data }) => {
            const received = JSON.parse(data);

            if (received.op === 1) {
                socket.send(JSON.stringify({ op: 3 }));
            }

            if (received.op === 0 && (received.t === 'INIT_STATE' || received.t === 'PRESENCE_UPDATE')) {
                const data = received.d as LanyardResponse;
                const formattedData = formatData(data);
                set(formattedData);
            }
        });
    }

    return {
        subscribe,
        set,
        update
    };
};

export const lanyardStore = createLanyardStore();