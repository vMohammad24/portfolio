<script lang="ts">
  import { lanyardStore } from "$lib/states/lanyard";
  import type { EnhancedLyricsResponse } from "$lib/types";
  import { viewport } from "$lib/utils/intersection";
  import { AlertTriangle, Music2 } from "@lucide/svelte";
  import { fade } from "svelte/transition";

  interface Props {
    currentTime: number;
  }

  let { currentTime }: Props = $props();

  let activeSong: {
    song: string;
    artist: string;
  } | null = $derived.by(() => {
    if ($lanyardStore?.spotify)
      return {
        song: $lanyardStore?.spotify.song,
        artist: $lanyardStore?.spotify.artist,
      };
    const activity = $lanyardStore?.activities?.find(
      (activity) => activity.type === 2,
    );
    return activity
      ? { song: activity.details, artist: activity.state.split(",")[0] }
      : null;
  });
  let lyrics: Promise<EnhancedLyricsResponse | null> = $derived.by(async () => {
    if (!activeSong) {
      return null;
    }
    const res = await fetch(
      `https://api.vmohammad.dev/lyrics?track=${encodeURIComponent(activeSong.song)}&artist=${encodeURIComponent(activeSong.artist)}`,
    );
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    if (data && data.enhancedLyrics) {
      return data as EnhancedLyricsResponse;
    }
    return null;
  });
  let sectionElement = $state<HTMLElement>();
  let lyricsContainer = $state<HTMLElement>();
  let currentLyricElement = $state<HTMLElement>();
  let currentLyricIndex = $state<number>(-1);
  let currentWordIndex = $state<number>(-1);

  function getElapsedTime(startTimestamp: number): number {
    return Math.max(0, (currentTime - startTimestamp) / 1000);
  }

  function isWordActive(
    wordTime: number,
    wordEndTime: number,
    songStartTime: number,
  ): boolean {
    const currentSongTime = getElapsedTime(songStartTime);
    return currentSongTime >= wordTime && currentSongTime < wordEndTime;
  }

  function isLineActive(
    lineTime: number,
    nextLineTime: number | null,
    songStartTime: number,
  ): boolean {
    const currentSongTime = getElapsedTime(songStartTime);
    const lineEndInSong = nextLineTime ? nextLineTime : lineTime + 5;
    return currentSongTime >= lineTime && currentSongTime < lineEndInSong;
  }

  $effect(() => {
    if (songStartTime && lyricsData?.enhancedLyrics) {
      let lineIndex = -1;
      for (let i = 0; i < lyricsData.enhancedLyrics.length; i++) {
        const line = lyricsData.enhancedLyrics[i];
        const nextLine = lyricsData.enhancedLyrics[i + 1];
        if (isLineActive(line.time, nextLine?.time || null, songStartTime)) {
          lineIndex = i;
          break;
        }
      }
      currentLyricIndex = lineIndex;
      if (lineIndex >= 0) {
        const currentLine = lyricsData.enhancedLyrics[lineIndex];
        let wordIndex = -1;
        if (currentLine.words) {
          for (let i = 0; i < currentLine.words.length; i++) {
            const word = currentLine.words[i];
            if (isWordActive(word.time, word.endTime, songStartTime)) {
              wordIndex = i;
              break;
            }
          }
        }
        currentWordIndex = wordIndex;
      } else {
        currentWordIndex = -1;
      }
    }
  });

  function scrollToCurrentLyric() {
    if (
      !lyricsContainer ||
      !lyricsData?.enhancedLyrics?.length ||
      currentLyricIndex < 0 ||
      !currentLyricElement
    ) {
      return;
    }
    try {
      if (currentLyricElement && lyricsContainer) {
        const containerHeight = lyricsContainer.clientHeight;
        const lyricTop = currentLyricElement.offsetTop;
        const lyricHeight = currentLyricElement.clientHeight;

        lyricsContainer.scrollTo({
          top: lyricTop - containerHeight / 2 + lyricHeight / 2,
          behavior: "smooth",
        });
      }
    } catch (error) {
      console.warn("Failed to scroll to current lyric:", error);
    }
  }

  $effect(() => {
    if (currentLyricElement && lyricsContainer) {
      scrollToCurrentLyric();
    }
  });
  let lyricsData = $state<EnhancedLyricsResponse | null>(null);

  $effect(() => {
    lyrics
      .then((data) => {
        lyricsData = data;
      })
      .catch(() => {
        lyricsData = null;
      });
  });

  let songStartTime = $derived.by(() => {
    if ($lanyardStore?.spotify?.timestamps?.start) {
      return $lanyardStore.spotify.timestamps.start;
    }

    const musicActivity = $lanyardStore?.activities?.find(
      (activity) => activity.type === 2,
    );
    return musicActivity?.timestamps?.start || null;
  });
</script>

{#if activeSong}
  <section
    bind:this={sectionElement}
    id="lyrics"
    class="transform rounded-2xl bg-base/90 p-8 shadow-2xl backdrop-blur-md transition-all duration-500 hover:shadow-purple/30 hover:scale-[1.02] md:col-span-12 border border-surface0/30"
    use:viewport.intersection
    class:animate-slide-up={sectionElement
      ? $viewport.get(sectionElement)
      : false}
  >
    <div class="relative">
      <div class="mb-8">
        <h2
          class="group relative mb-6 inline-block text-2xl font-bold text-text"
        >
          <Music2 class="inline-block mr-2 h-8 w-8 text-purple" />
          Now Playing
          <span
            class="absolute bottom-0 left-0 h-1 w-0 bg-teal transition-all duration-500 group-hover:w-full"
          ></span>
        </h2>

        <div class="space-y-2">
          <h3 class="text-2xl font-semibold text-text leading-tight">
            {activeSong.song}
          </h3>
          <p class="text-text-muted text-lg flex items-center gap-2">
            <span class="w-1 h-1 bg-purple rounded-full"></span>
            by {activeSong.artist}
          </p>
        </div>
      </div>
      {#await lyrics}
        <div
          class="flex items-center justify-center p-12"
          in:fade={{ duration: 400 }}
        >
          <div class="flex flex-col items-center gap-4">
            <div class="relative">
              <div
                class="h-8 w-8 animate-spin rounded-full border-3 border-purple/30 border-t-purple"
              ></div>
              <div
                class="absolute inset-0 h-8 w-8 animate-pulse rounded-full border-2 border-purple/20"
              ></div>
            </div>
            <span class="text-text-muted text-lg font-medium"
              >Loading lyrics...</span
            >
            <div class="flex gap-1">
              <div class="w-2 h-2 bg-purple rounded-full animate-bounce"></div>
              <div
                class="w-2 h-2 bg-purple rounded-full animate-bounce"
                style="animation-delay: 0.1s"
              ></div>
              <div
                class="w-2 h-2 bg-purple rounded-full animate-bounce"
                style="animation-delay: 0.2s"
              ></div>
            </div>
          </div>
        </div>
      {:then lyricsData}
        {#if lyricsData?.enhancedLyrics?.length}
          <div
            class="flex-1 overflow-y-auto p-4 scrollbar-none max-h-[28rem] rounded-xl bg-surface0/30 backdrop-blur-sm border border-surface0/20 shadow-inner scroll-smooth lyrics-container"
            bind:this={lyricsContainer}
          >
            <div class="flex flex-col gap-6 pb-8">
              {#each lyricsData.enhancedLyrics as line, i}
                {#if i === currentLyricIndex}
                  <div
                    class="text-2xl leading-relaxed min-h-[60px] p-5 rounded-xl bg-purple/20 shadow-lg transform transition-all duration-300"
                    bind:this={currentLyricElement}
                    in:fade={{
                      duration: 300,
                    }}
                  >
                    {#if line.words && line.words.length > 0}
                      {#each line.words as word, wordIndex}
                        {#if word.isParenthetical}
                          <span
                            class="inline-block mr-1 opacity-70 text-text-muted font-light italic transition-all duration-300 ease-out hover:text-purple/80 cursor-pointer {wordIndex ===
                            currentWordIndex
                              ? 'text-purple scale-105'
                              : 'scale-100'}"
                          >
                            {word.word}
                          </span>
                        {:else}
                          <span
                            class="inline-block mr-1 transition-all duration-300 ease-out hover:text-purple cursor-pointer
                              {wordIndex <= currentWordIndex
                              ? 'text-purple'
                              : ''} 
                              {wordIndex === currentWordIndex
                              ? 'font-semibold scale-105'
                              : 'font-normal scale-100'}"
                          >
                            {word.word}
                          </span>
                        {/if}
                      {/each}
                    {:else}
                      <span class="text-purple font-medium">
                        {line.text || "♪ [Instrumental] ♪"}
                      </span>
                    {/if}
                  </div>
                {:else}
                  <div class="min-h-[60px] relative">
                    <p
                      class="text-xl leading-relaxed whitespace-pre-wrap cursor-pointer hover:text-purple p-4 rounded-lg hover:bg-purple/5
                             transition-all duration-300 absolute inset-0
                             {i < currentLyricIndex
                        ? 'opacity-40'
                        : 'opacity-60'} 
                             hover:opacity-90 hover:scale-[1.02] hover:pl-5"
                    >
                      {#if line.words && line.words.length > 0}
                        {#each line.words as word}
                          <span class="mr-1">{word.word}</span>
                        {/each}
                      {:else}
                        {line.text || "♪ [Instrumental] ♪"}
                      {/if}
                    </p>
                  </div>
                {/if}
              {/each}
            </div>
          </div>
        {:else}
          <div
            class="text-center p-12 rounded-xl bg-surface0/30 backdrop-blur-sm border border-surface0/20"
            in:fade={{ duration: 400 }}
          >
            <div class="text-text-muted">
              <div class="flex justify-center mb-6">
                <div class="relative">
                  <Music2 class="h-16 w-16 text-purple/60" />
                  <div
                    class="absolute inset-0 h-16 w-16 bg-purple/20 rounded-full animate-ping"
                  ></div>
                </div>
              </div>
              <h3 class="mb-3 text-xl font-semibold text-text">
                No Lyrics Available
              </h3>
              <p class="text-base opacity-80 max-w-md mx-auto leading-relaxed">
                We couldn't find the lyrics for this song.
              </p>
              <div class="mt-6 flex justify-center">
                <div class="flex gap-1">
                  <div class="w-2 h-2 bg-purple/40 rounded-full"></div>
                  <div class="w-2 h-2 bg-purple/60 rounded-full"></div>
                  <div class="w-2 h-2 bg-purple/40 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        {/if}
      {:catch error}
        <div
          class="text-center p-12 rounded-xl bg-red/10 border border-red/20 backdrop-blur-sm"
          in:fade={{ duration: 400 }}
        >
          <div class="text-red">
            <div class="flex justify-center mb-6">
              <div class="relative">
                <AlertTriangle class="h-16 w-16" />
                <div
                  class="absolute inset-0 h-16 w-16 bg-red/20 rounded-full animate-pulse"
                ></div>
              </div>
            </div>
            <h3 class="mb-3 text-xl font-semibold">Failed to Load Lyrics</h3>
            <p class="text-base opacity-80 max-w-md mx-auto leading-relaxed">
              Unable to fetch lyrics data from the server. Please check your
              connection and try again.
            </p>
            <div class="mt-6">
              <button
                class="px-4 py-2 bg-red/20 hover:bg-red/30 rounded-lg transition-colors duration-200 text-sm font-medium"
                onclick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      {/await}
    </div>
  </section>
{/if}

<style>
  :global(.lyrics-container) {
    scrollbar-width: thin;
    scrollbar-color: rgba(147, 51, 234, 0.5) transparent;
  }

  :global(.lyrics-container::-webkit-scrollbar) {
    width: 8px;
  }

  :global(.lyrics-container::-webkit-scrollbar-track) {
    background: transparent;
  }

  :global(.lyrics-container::-webkit-scrollbar-thumb) {
    background-color: rgba(147, 51, 234, 0.5);
    border-radius: 4px;
  }

  :global(.lyrics-container::-webkit-scrollbar-thumb:hover) {
    background-color: rgba(147, 51, 234, 0.7);
  }

  :global(.scrollbar-none) {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  :global(.scrollbar-none::-webkit-scrollbar) {
    display: none;
  }
</style>
