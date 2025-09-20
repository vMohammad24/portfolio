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

    let currentData: LanyardResponse | null = null;
    let socket: WebSocket | null = null;
    let reconnectAttempts = 0;
    let maxReconnectAttempts = 5;
    let reconnectDelay = 1000;
    let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
    let isConnecting = false;

    function dataChanged(newData: LanyardResponse, oldData: LanyardResponse | null): boolean {
        if (!oldData) return true;
        return JSON.stringify(newData) !== JSON.stringify(oldData);
    }

    function connectWebSocket() {
        if (isConnecting || (socket && socket.readyState === WebSocket.CONNECTING)) {
            return;
        }

        isConnecting = true;

        if (socket) {
            socket.close();
        }

        socket = new WebSocket(`wss://${DOMAIN}/socket`);

        socket.addEventListener('open', () => {
            console.log('Connected to Lanyard WebSocket');
            isConnecting = false;
            reconnectAttempts = 0;
            reconnectDelay = 1000;

            socket!.send(
                JSON.stringify({
                    op: 2,
                    d: {
                        subscribe_to_id: discordId
                    }
                })
            );

            if (heartbeatInterval) {
                clearInterval(heartbeatInterval);
            }
            heartbeatInterval = setInterval(() => {
                if (socket && socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({ op: 3 }));
                }
            }, 30000);
        });

        socket.addEventListener('message', ({ data }) => {
            const received = JSON.parse(data);

            if (received.op === 1) {
                socket!.send(JSON.stringify({ op: 3 }));
            }

            if (received.op === 0 && (received.t === 'INIT_STATE' || received.t === 'PRESENCE_UPDATE')) {
                const data = received.d as LanyardResponse;
                const formattedData = formatData(data);

                if (dataChanged(formattedData, currentData)) {
                    currentData = formattedData;
                    set(formattedData);
                }
            }
        });

        socket.addEventListener('close', (event) => {
            console.log('Lanyard WebSocket closed:', event.code, event.reason);
            isConnecting = false;

            if (heartbeatInterval) {
                clearInterval(heartbeatInterval);
                heartbeatInterval = null;
            }

            if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
                reconnectAttempts++;
                console.log(`Attempting to reconnect... (${reconnectAttempts}/${maxReconnectAttempts})`);

                setTimeout(() => {
                    connectWebSocket();
                }, reconnectDelay);
                reconnectDelay = Math.min(reconnectDelay * 2, 30000);
            } else if (reconnectAttempts >= maxReconnectAttempts) {
                console.error('Max reconnection attempts reached. WebSocket connection failed.');
            }
        });

        socket.addEventListener('error', (error) => {
            console.error('Lanyard WebSocket error:', error);
            isConnecting = false;
        });
    }

    if (browser) {
        connectWebSocket();

        document.addEventListener('visibilitychange', async () => {
            if (!document.hidden) {
                try {
                    const freshData = await fetchLanyard();

                    if (dataChanged(freshData, currentData)) {
                        console.log('Data mismatch detected, reconnecting WebSocket...');
                        currentData = freshData;
                        set(freshData);

                        reconnectAttempts = 0;
                        connectWebSocket();
                    } else {
                        console.log('Data is up to date');
                    }
                } catch (error) {
                    console.error('Failed to refresh Lanyard data:', error);

                    if (!socket || socket.readyState !== WebSocket.OPEN) {
                        console.log('WebSocket not connected, attempting reconnection...');
                        connectWebSocket();
                    }
                }
            }
        });

        const cleanup = () => {
            if (socket) {
                socket.close(1000, 'Component unmounted');
            }
            if (heartbeatInterval) {
                clearInterval(heartbeatInterval);
            }
        };
        window.addEventListener('beforeunload', cleanup);
    }

    return {
        subscribe,
        set,
        update,
        reconnect: () => {
            if (browser) {
                reconnectAttempts = 0;
                connectWebSocket();
            }
        }
    };
};

export const lanyardStore = createLanyardStore();