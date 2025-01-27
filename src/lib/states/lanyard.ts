import { browser } from '$app/environment';
import type { LanyardResponse } from '$lib/types/landyard';
import { writable } from 'svelte/store';

const discordId = '921098159348924457';

const createLanyardStore = () => {
    const { subscribe, set, update } = writable<LanyardResponse | null>(null);

    if (browser) {
        const socket = new WebSocket('wss://lanyard.vmohammad.dev/socket');

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
                set(data);
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