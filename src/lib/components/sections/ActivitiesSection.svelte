<script lang="ts">
  import type { Activity } from "$lib/types";
  import { backOut } from "svelte/easing";
  import { fly, slide } from "svelte/transition";
  interface Props {
    regularActivities: Activity[];
    currentTime: number;
  }

  let { regularActivities, currentTime }: Props = $props();

  function getElapsedTime(startTimestamp: number): string {
    const seconds = Math.floor((currentTime - startTimestamp) / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  }

  function getTimeUntil(endTimestamp: number): string {
    const totalSeconds = Math.floor((endTimestamp - currentTime) / 1000);
    const seconds = Math.max(0, totalSeconds);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m left`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s left`;
    }
    return `${seconds}s left`;
  }

  function formatDuration(start: number, end: number): string {
    const totalSeconds = Math.floor((end - start) / 1000);
    const seconds = Math.max(0, totalSeconds);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }

  function getSongProgress(start: number, end: number): number {
    const total = end - start;
    const elapsed = Math.min(currentTime - start, total);
    return Math.floor((elapsed / total) * 100);
  }
</script>

<section
  class="transform rounded-xl bg-gradient-to-br from-base/80 to-surface0/40 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:shadow-green/20 md:col-span-7"
>
  <h2 class="group relative mb-6 inline-block text-2xl font-bold text-text">
    Current Activities
    <span
      class="absolute bottom-0 left-0 h-1 w-0 bg-green transition-all duration-500 group-hover:w-full"
    ></span>
  </h2>

  {#if regularActivities.length > 0}
    <div class="space-y-4">
      {#each regularActivities as activity, i}
        <div
          class="bg-base-dark/50 transform rounded-lg p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-surface0/70 hover:shadow-md"
          in:fly={{
            y: 20,
            duration: 400,
            delay: 300 + i * 100,
            easing: backOut,
          }}
        >
          <div class="flex items-start gap-4">
            {#if activity.assets?.large_image}
              <img
                src={activity.assets.large_image}
                alt={activity.name}
                class="h-16 w-16 rounded-md object-cover shadow-sm transition-transform duration-300 hover:rotate-3 hover:scale-110"
              />
            {/if}
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <span class="font-medium text-text">{activity.name}</span>
                {#if activity.timestamps?.start}
                  <span class="flex items-center gap-1 text-sm text-green">
                    <span
                      class="inline-block h-2 w-2 animate-pulse rounded-full bg-green"
                    ></span>
                    <span class="group relative">
                      {#if activity.type === 2 && activity.timestamps.end}
                        <span class="transition-opacity duration-300">
                          {getTimeUntil(activity.timestamps.end)}
                        </span>
                        <span
                          class="absolute -top-8 right-0 whitespace-nowrap rounded-md bg-surface0/90 px-2 py-1 text-xs opacity-0 shadow-md transition-opacity duration-300 group-hover:opacity-100"
                        >
                          {formatDuration(
                            activity.timestamps.start,
                            activity.timestamps.end,
                          )}
                        </span>
                      {:else}
                        <span class="transition-opacity duration-300">
                          {getElapsedTime(activity.timestamps.start)}
                        </span>
                        <span
                          class="absolute -top-8 right-0 whitespace-nowrap rounded-md bg-surface0/90 px-2 py-1 text-xs opacity-0 shadow-md transition-opacity duration-300 group-hover:opacity-100"
                        >
                          Started: {new Date(
                            activity.timestamps.start,
                          ).toLocaleTimeString()}
                        </span>
                      {/if}
                    </span>
                  </span>
                {/if}
              </div>

              {#if activity.type === 2 && activity.timestamps?.start && activity.timestamps?.end}
                {@const progress = getSongProgress(
                  activity.timestamps.start,
                  activity.timestamps.end,
                )}
                {#key currentTime}
                  <div class="mb-1.5 mt-2.5">
                    <div
                      class="relative h-1.5 w-full overflow-hidden rounded-full bg-surface0/50"
                    >
                      <div
                        class="h-full rounded-full bg-gradient-to-r from-green/70 to-green/90 transition-[width] duration-500 ease-out"
                        style="width: {progress}%;"
                      >
                        <div
                          class="h-full w-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          style="background-size: 200% 100%;"
                        ></div>
                      </div>
                    </div>
                  </div>
                {/key}
              {:else if activity.timestamps?.start && !activity.timestamps?.end}
                <div class="mb-1.5 mt-2.5">
                  <div
                    class="relative h-1.5 w-full overflow-hidden rounded-full bg-surface0/50"
                  >
                    <div
                      class="relative h-full animate-progress-indeterminate rounded-full bg-gradient-to-r from-green/70 to-green/90"
                    ></div>
                  </div>
                </div>
              {/if}

              {#if activity.details}
                <p class="text-text-muted mt-1">{activity.details}</p>
              {/if}
              {#if activity.state}
                <p class="text-text-muted mt-1 text-sm">
                  {activity.state}
                </p>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div
      class="rounded-lg bg-surface0/30 p-6 backdrop-blur-sm"
      in:slide={{ duration: 400, delay: 300 }}
    >
      <p class="text-text-muted text-center">Currently not doing anything</p>
    </div>
  {/if}
</section>
