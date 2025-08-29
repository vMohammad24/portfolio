<script lang="ts">
  import { lanyardStore } from "$lib/states/lanyard";
  import { viewport } from "$lib/utils/intersection";
  import { Calendar, Clock, Star, Tv } from "@lucide/svelte";
  import { fade } from "svelte/transition";

  interface Props {
    currentTime: number;
  }

  let { currentTime = $bindable(0) }: Props = $props();

  let watchingActivity = $derived.by(() => {
    const activity = $lanyardStore?.activities?.find(
      (activity) => activity.type === 3
    );
    return activity || null;
  });

  let watchingData = $derived.by(() => {
    if (!watchingActivity) return null;

    const title = watchingActivity.details || "Unknown Title";
    const episode = watchingActivity.state || "";
    const artwork = watchingActivity.assets?.large_image || null;
    const showTitle = watchingActivity.assets?.large_text || title;

    const startTime = watchingActivity.timestamps?.start;
    const endTime = watchingActivity.timestamps?.end;
    let progress = null;
    let duration = null;

    if (startTime && endTime) {
      const totalDuration = (endTime - startTime) / 1000;
      const elapsed = Math.max(0, (currentTime - startTime) / 1000);
      progress = Math.min(elapsed / totalDuration, 1);
      duration = totalDuration;
    }

    return {
      title,
      episode,
      showTitle,
      artwork,
      progress,
      duration,
      startTime,
    };
  });

  let tmdbData = $state<
    Promise<{
      overview: string;
      vote_average: number;
      vote_count: number;
      release_date?: string;
      first_air_date?: string;
      genre_ids: number[];
      poster_path?: string;
      backdrop_path?: string;
      type: "movie" | "tv";
    } | null>
  >(Promise.resolve(null));

  let previousTmdbKey = $state<string>("");

  $effect(() => {
    if (!watchingData) {
      previousTmdbKey = "";
      tmdbData = Promise.resolve(null);
      return;
    }

    const searchTitle =
      watchingData.showTitle !== watchingData.title
        ? watchingData.showTitle
        : watchingData.title;

    const yearMatch = watchingData.episode.match(/\((\d{4})\)/);
    const year = yearMatch ? yearMatch[1] : "";
    const currentTmdbKey = `${searchTitle}|${year}`;

    if (currentTmdbKey !== previousTmdbKey) {
      previousTmdbKey = currentTmdbKey;
      tmdbData = (async () => {
        try {
          let searchUrl = `https://api-dev.vmohammad.dev/tmdb/search/multi?q=${encodeURIComponent(searchTitle)}&page=1&includeAdult=false&language=en`;

          if (year) {
            searchUrl += `&year=${year}`;
          }

          const response = await fetch(searchUrl);

          if (response.ok) {
            const data = await response.json();
            if (data.results && data.results.length > 0) {
              let result = data.results[0];
              if (year) {
                const match = data.results.find(
                  (item: any) =>
                    item.release_date && item.release_date.startsWith(year)
                );
                if (match) {
                  result = match;
                }
              }

              const isMovie =
                result.media_type === "movie" || result.release_date;

              return {
                overview: result.overview,
                vote_average: result.vote_average,
                vote_count: result.vote_count,
                release_date: result.release_date,
                first_air_date: result.first_air_date,
                genre_ids: result.genre_ids,
                poster_path: result.poster_path,
                backdrop_path: result.backdrop_path,
                type: isMovie ? ("movie" as const) : ("tv" as const),
              };
            }
          }

          return null;
        } catch (error) {
          console.error("Failed to fetch TMDB data:", error);
          return null;
        }
      })();
    }
  });

  function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  }

  function getElapsedTime(startTimestamp: number): number {
    return Math.max(0, (currentTime - startTimestamp) / 1000);
  }

  let sectionElement = $state<HTMLElement>();
</script>

{#if watchingActivity && watchingData}
  <section
    bind:this={sectionElement}
    id="watching"
    class="transform rounded-xl bg-base/90 p-6 shadow-lg backdrop-blur-md transition-all duration-300 md:col-span-12 border border-surface0/30"
    use:viewport.intersection
    class:animate-slide-up={sectionElement
      ? $viewport.get(sectionElement)
      : false}
  >
    <div class="relative">
      <div class="mb-6">
        <h2 class="mb-4 inline-block text-xl font-bold text-text">
          <Tv class="inline-block mr-2 h-6 w-6 text-blue" />
          Currently Watching
        </h2>

        <div class="space-y-4">
          <div class="flex items-start gap-4">
            {#await tmdbData}
              {#if watchingData.artwork}
                <div class="flex-shrink-0">
                  <img
                    src={watchingData.artwork}
                    alt="Show poster"
                    class="w-24 h-36 rounded-lg object-cover shadow-lg border border-surface0/30"
                    loading="lazy"
                  />
                </div>
              {/if}
            {:then data}
              {#if data?.poster_path}
                <div class="flex-shrink-0">
                  <img
                    src={`https://image.tmdb.org/t/p/w300${data.poster_path}`}
                    alt="Show poster"
                    class="w-24 h-36 rounded-lg object-cover shadow-lg border border-surface0/30"
                    loading="lazy"
                  />
                </div>
              {:else if watchingData.artwork}
                <div class="flex-shrink-0">
                  <img
                    src={watchingData.artwork}
                    alt="Show poster"
                    class="w-24 h-36 rounded-lg object-cover shadow-lg border border-surface0/30"
                    loading="lazy"
                  />
                </div>
              {/if}
            {:catch}
              {#if watchingData.artwork}
                <div class="flex-shrink-0">
                  <img
                    src={watchingData.artwork}
                    alt="Show poster"
                    class="w-24 h-36 rounded-lg object-cover shadow-lg border border-surface0/30"
                    loading="lazy"
                  />
                </div>
              {/if}
            {/await}

            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-semibold text-text leading-tight mb-1">
                {watchingData.title}
              </h3>

              {#if watchingData.episode && watchingData.episode !== watchingData.title}
                <p class="text-base text-text-muted mb-2">
                  {watchingData.episode}
                </p>
              {/if}

              {#if watchingData.showTitle && watchingData.showTitle !== watchingData.title}
                <p class="text-sm text-blue font-medium">
                  {watchingData.showTitle}
                </p>
              {/if}

              {#if watchingData.progress !== null && watchingData.duration}
                <div class="mt-4 space-y-2">
                  <div class="flex items-center gap-2 text-sm text-text-muted">
                    <Clock class="w-4 h-4" />
                    <span>
                      {formatTime(getElapsedTime(watchingData.startTime))} / {formatTime(
                        watchingData.duration
                      )}
                    </span>
                  </div>

                  <div
                    class="w-full h-2 rounded-full bg-surface0/40 overflow-hidden"
                  >
                    <div
                      class="h-full bg-blue transition-all duration-1000 ease-out"
                      style="width: {watchingData.progress * 100}%;"
                    ></div>
                  </div>

                  <p class="text-xs text-text-muted">
                    {Math.round(watchingData.progress * 100)}% complete
                  </p>
                </div>
              {/if}
            </div>
          </div>

          {#await tmdbData}
            <div
              class="mt-4 p-4 rounded-lg bg-surface0/20 border border-surface0/20"
            >
              <div class="flex items-center gap-2 mb-2">
                <div class="h-4 w-4 bg-surface0/30 rounded animate-pulse"></div>
                <div
                  class="h-4 bg-surface0/30 rounded animate-pulse w-20"
                ></div>
              </div>
              <div class="h-16 bg-surface0/30 rounded animate-pulse"></div>
            </div>
          {:then data}
            {#if data}
              <div
                class="mt-4 p-4 rounded-lg bg-surface0/20 border border-surface0/20"
                transition:fade={{ duration: 300 }}
              >
                <div class="flex items-center gap-4 mb-3">
                  <div class="flex items-center gap-1">
                    <Star class="w-4 h-4 text-yellow-400 fill-current" />
                    <span class="text-sm font-medium text-text">
                      {data.vote_average.toFixed(1)}
                    </span>
                    <span class="text-xs text-text-muted">
                      ({data.vote_count.toLocaleString()} votes)
                    </span>
                  </div>

                  {#if data.release_date || data.first_air_date}
                    <div class="flex items-center gap-1">
                      <Calendar class="w-4 h-4 text-blue" />
                      <span class="text-sm text-text-muted">
                        {new Date(
                          (data.release_date || data.first_air_date)!
                        ).getFullYear()}
                      </span>
                    </div>
                  {/if}

                  <span
                    class="text-xs px-2 py-1 rounded-full bg-blue/20 text-blue font-medium"
                  >
                    {data.type === "tv" ? "TV Show" : "Movie"}
                  </span>
                </div>

                {#if data.overview}
                  <p class="text-sm text-text-muted leading-relaxed">
                    {data.overview}
                  </p>
                {/if}
              </div>
            {/if}
          {/await}
        </div>
      </div>
    </div>
  </section>
{/if}

<style>
  :global(.watching-container) {
    scrollbar-width: thin;
    scrollbar-color: rgba(147, 51, 234, 0.5) transparent;
  }

  :global(.watching-container::-webkit-scrollbar) {
    width: 8px;
  }

  :global(.watching-container::-webkit-scrollbar-track) {
    background: transparent;
  }

  :global(.watching-container::-webkit-scrollbar-thumb) {
    background-color: rgba(147, 51, 234, 0.5);
    border-radius: 4px;
  }

  :global(.watching-container::-webkit-scrollbar-thumb:hover) {
    background-color: rgba(147, 51, 234, 0.7);
  }
</style>
