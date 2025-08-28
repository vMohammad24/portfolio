<script lang="ts">
  import { lanyardStore } from "$lib/states/lanyard";
  import type { EnhancedLyricsResponse } from "$lib/types";
  import { viewport } from "$lib/utils/intersection";
  import { Music2, Pause, Play, TriangleAlert } from "@lucide/svelte";
  import { fade } from "svelte/transition";

  interface Props {
    currentTime: number;
  }

  let { currentTime = $bindable(0) }: Props = $props();

  let rawSong: {
    song: string;
    artist: string;
  } | null = $derived.by(() => {
    if ($lanyardStore?.spotify)
      return {
        song: $lanyardStore?.spotify.song,
        artist: $lanyardStore?.spotify.artist,
      };
    const activity = $lanyardStore?.activities?.find(
      (activity) => activity.type === 2
    );
    return activity
      ? { song: activity.details, artist: activity.state.split(",")[0] }
      : null;
  });

  let previousSearchKey = $state<string>("");
  let songData = $state<
    Promise<{
      song: string;
      artist: string;
      previewUrl: string | null;
      releaseDate: string | null;
      artwork: {
        url: string;
        bgColor: string;
        textColor1: string;
        textColor2: string;
      } | null;
      albumName: string;
    } | null>
  >(Promise.resolve(null));

  let activeSong = $state<{ song: string; artist: string } | null>(null);

  $effect(() => {
    songData.then((data) => {
      activeSong = data ? { song: data.song, artist: data.artist } : rawSong;
    });
  });

  $effect(() => {
    if (!rawSong) {
      previousSearchKey = "";
      songData = Promise.resolve(null);
      return;
    }

    const currentSearchKey = `${rawSong.song}|${rawSong.artist}`;

    if (currentSearchKey !== previousSearchKey) {
      previousSearchKey = currentSearchKey;
      songData = (async () => {
        try {
          if ($lanyardStore?.spotify) {
            const res = await fetch(
              `https://api.vmohammad.dev/apple/search?q=${encodeURIComponent(rawSong.song)} ${encodeURIComponent(rawSong.artist)}`
            );
            if (res.ok) {
              const data = await res.json();
              const song = data?.results?.song?.data?.[0];
              if (song) {
                return {
                  song: song.name,
                  artist: song.attributes.artistName,
                  releaseDate: song.attributes.releaseDate || null,
                  previewUrl: song.attributes?.previews?.[0]?.url || null,
                  artwork: song.attributes?.artwork
                    ? {
                        url: song.attributes.artwork.url.replace(
                          "{w}x{h}",
                          "300x300"
                        ),
                        bgColor: song.attributes.artwork.bgColor || "0d0f0e",
                        textColor1:
                          song.attributes.artwork.textColor1 || "f9f4ef",
                        textColor2:
                          song.attributes.artwork.textColor2 || "e1b235",
                      }
                    : null,
                  albumName: song.attributes?.albumName || "",
                };
              }
            }
            return {
              song: rawSong.song,
              artist: rawSong.artist,
              previewUrl: null,
              artwork: null,
              albumName: "",
              releaseDate: null,
            };
          }

          const res = await fetch(
            `https://api.vmohammad.dev/apple/search?q=${encodeURIComponent(rawSong.song)} ${encodeURIComponent(rawSong.artist)}`
          );
          if (!res.ok) {
            return {
              song: rawSong.song,
              artist: rawSong.artist,
              previewUrl: null,
              artwork: null,
              albumName: "",
              releaseDate: null,
            };
          }
          const data = await res.json();
          const song = data?.results?.song?.data?.[0];
          if (song) {
            return {
              song: song.attributes.name,
              artist: song.attributes.artistName,
              previewUrl: song.attributes?.previews?.[0]?.url || null,
              artwork: song.attributes?.artwork
                ? {
                    url: song.attributes.artwork.url.replace(
                      "{w}x{h}",
                      "300x300"
                    ),
                    bgColor: song.attributes.artwork.bgColor || "0d0f0e",
                    textColor1: song.attributes.artwork.textColor1 || "f9f4ef",
                    textColor2: song.attributes.artwork.textColor2 || "e1b235",
                  }
                : null,
              albumName: song.attributes?.albumName || "",
              releaseDate: song.attributes?.releaseDate || null,
            };
          }
          return {
            song: rawSong.song,
            artist: rawSong.artist,
            previewUrl: null,
            artwork: null,
            albumName: "",
            releaseDate: null,
          };
        } catch (error) {
          console.error("Failed to fetch song data:", error);
          return {
            song: rawSong.song,
            artist: rawSong.artist,
            previewUrl: null,
            artwork: null,
            albumName: "",
            releaseDate: null,
          };
        }
      })();
    }
  });

  let audioElement = $state<HTMLAudioElement>();
  let isPlaying = $state(false);
  let audioCurrentTime = $state(0);
  let duration = $state(0);
  let isLoading = $state(false);

  function togglePlayback() {
    if (!audioElement) return;

    if (isPlaying) {
      audioElement.pause();
    } else {
      isLoading = true;
      audioElement.play().catch(console.error);
    }
  }

  function onTimeUpdate() {
    if (audioElement) {
      audioCurrentTime = audioElement.currentTime;
    }
  }

  function onLoadedMetadata() {
    if (audioElement) {
      duration = audioElement.duration;
    }
  }

  function onPlay() {
    isPlaying = true;
    isLoading = false;
  }

  function onPause() {
    isPlaying = false;
    isLoading = false;
  }

  function onLoadStart() {
    isLoading = true;
  }

  function onCanPlay() {
    isLoading = false;
  }

  function seekTo(event: MouseEvent) {
    if (!audioElement || !duration) return;

    const progressBar = event.currentTarget as HTMLElement;
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = (event.clientX - rect.left) / rect.width;
    const newTime = clickPosition * duration;

    audioElement.currentTime = newTime;
  }

  let previousLyricsKey = $state<string>("");
  let lyrics = $state<Promise<EnhancedLyricsResponse | null>>(
    Promise.resolve(null)
  );

  $effect(() => {
    songData.then(async (data) => {
      if (!data) {
        previousLyricsKey = "";
        lyrics = Promise.resolve(null);
        return;
      }

      const currentLyricsKey = `${data.song}|${data.artist}`;

      if (currentLyricsKey !== previousLyricsKey) {
        previousLyricsKey = currentLyricsKey;
        lyrics = (async () => {
          const res = await fetch(
            `https://api.vmohammad.dev/lyrics?track=${encodeURIComponent(data.song)}&artist=${encodeURIComponent(data.artist)}`
          );
          if (!res.ok) {
            return null;
          }
          const lyricsData = await res.json();
          if (lyricsData && lyricsData.enhancedLyrics) {
            return lyricsData as EnhancedLyricsResponse;
          }
          return null;
        })();
      }
    });
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
    songStartTime: number
  ): boolean {
    const currentSongTime = getElapsedTime(songStartTime);
    return currentSongTime >= wordTime && currentSongTime < wordEndTime;
  }

  function isLineActive(
    lineTime: number,
    nextLineTime: number | null,
    songStartTime: number
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
      (activity) => activity.type === 2
    );
    return musicActivity?.timestamps?.start || null;
  });
</script>

{#if rawSong}
  <section
    bind:this={sectionElement}
    id="lyrics"
    class="transform rounded-xl bg-base/90 p-6 shadow-lg backdrop-blur-md transition-all duration-300 md:col-span-12 border border-surface0/30"
    use:viewport.intersection
    class:animate-slide-up={sectionElement
      ? $viewport.get(sectionElement)
      : false}
  >
    <div class="relative">
      <div class="mb-6">
        <h2 class="mb-4 inline-block text-xl font-bold text-text">
          <Music2 class="inline-block mr-2 h-6 w-6 text-blue" />
          Now Playing
        </h2>

        {#await songData}
          <div class="space-y-2">
            <div class="h-6 bg-surface0/30 rounded animate-pulse"></div>
            <div class="h-4 bg-surface0/20 rounded animate-pulse w-2/3"></div>
          </div>
        {:then data}
          {#if data}
            <div class="space-y-2">
              <h3 class="text-lg font-semibold text-text leading-tight">
                {data.song} by {data.artist}
              </h3>
            </div>

            {#if data.previewUrl && data.artwork}
              <div
                class="mt-4 p-3 rounded-lg border border-surface0/30 bg-surface0/10"
              >
                <div class="flex items-center gap-3">
                  <img
                    src={data.artwork.url}
                    alt="Album artwork"
                    class="w-12 h-12 rounded-md object-cover"
                  />

                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-text truncate">
                      {data.song}
                    </p>
                    <p class="text-xs text-text-muted truncate">
                      {data.artist}
                      {#if data.releaseDate}<span class="text-opacity-50">
                          •
                          {new Date(data.releaseDate).getFullYear()}</span
                        >{/if}
                    </p>
                  </div>

                  <button
                    onclick={togglePlayback}
                    disabled={isLoading}
                    class="flex items-center justify-center w-10 h-10 rounded-full bg-blue/20 hover:bg-blue/30 border border-blue/40 transition-all duration-200 disabled:opacity-50"
                  >
                    {#if isLoading}
                      <div
                        class="w-4 h-4 border-2 border-blue border-t-transparent rounded-full animate-spin"
                      ></div>
                    {:else if isPlaying}
                      <Pause class="w-4 h-4 text-blue" />
                    {:else}
                      <Play class="w-4 h-4 ml-0.5 text-blue" />
                    {/if}
                  </button>
                </div>

                {#if duration > 0}
                  <div class="mt-3">
                    <button
                      type="button"
                      class="w-full h-2 rounded-full cursor-pointer bg-surface0/40 overflow-hidden"
                      aria-label="Seek audio"
                      onclick={seekTo}
                    >
                      <div
                        class="h-full bg-blue transition-all duration-200"
                        style="width: {(audioCurrentTime / duration) * 100}%;"
                      ></div>
                    </button>
                    <div
                      class="flex justify-between mt-1 text-xs text-text-muted"
                    >
                      <span>{Math.floor(audioCurrentTime)}s</span>
                      <span>{Math.floor(duration)}s</span>
                    </div>
                  </div>
                {/if}

                <audio
                  bind:this={audioElement}
                  src={data.previewUrl}
                  ontimeupdate={onTimeUpdate}
                  onloadedmetadata={onLoadedMetadata}
                  onplay={onPlay}
                  onpause={onPause}
                  onloadstart={onLoadStart}
                  oncanplay={onCanPlay}
                  preload="metadata"
                ></audio>
              </div>
            {/if}
          {/if}
        {/await}
      </div>
      {#await lyrics}
        <div
          class="flex items-center justify-center p-12"
          in:fade={{ duration: 400 }}
        >
          <div class="flex flex-col items-center gap-3">
            <div
              class="h-6 w-6 animate-spin rounded-full border-2 border-blue/30 border-t-blue"
            ></div>
            <span class="text-text-muted text-base">Loading lyrics...</span>
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
                    class="text-2xl leading-relaxed min-h-[60px] p-5 rounded-xl shadow-lg transform transition-all duration-300"
                    bind:this={currentLyricElement}
                    in:fade={{
                      duration: 300,
                    }}
                  >
                    {#if line.words && line.words.length > 0}
                      {#each line.words as word, wordIndex}
                        {#if word.isParenthetical}
                          <span
                            class="inline-block mr-1 opacity-70 text-text-muted font-light italic transition-all duration-300 ease-out hover:text-blue/80 cursor-pointer {wordIndex ===
                            currentWordIndex
                              ? 'text-blue scale-105'
                              : 'scale-100'}"
                          >
                            {word.word}
                          </span>
                        {:else}
                          <span
                            class="inline-block mr-1 transition-all duration-300 ease-out hover:text-blue cursor-pointer
                              {wordIndex <= currentWordIndex
                              ? 'text-blue'
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
                      <span class="text-blue font-medium">
                        {line.text || "♪"}
                      </span>
                    {/if}
                  </div>
                {:else}
                  <div class="min-h-[60px] relative">
                    <p
                      class="text-xl leading-relaxed whitespace-pre-wrap cursor-pointer hover:text-blue p-4 rounded-lg hover:bg-blue/5
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
            class="text-center p-8 rounded-lg bg-surface0/20 border border-surface0/20"
            in:fade={{ duration: 400 }}
          >
            <div class="text-text-muted">
              <div class="flex justify-center mb-4">
                <Music2 class="h-12 w-12 text-blue/60" />
              </div>
              <h3 class="mb-2 text-lg font-semibold text-text">
                No Lyrics Available
              </h3>
              <p class="text-sm opacity-80 max-w-md mx-auto">
                We couldn't find the lyrics for this song.
              </p>
            </div>
          </div>
        {/if}
      {:catch error}
        <div
          class="text-center p-8 rounded-lg bg-red/10 border border-red/20"
          in:fade={{ duration: 400 }}
        >
          <div class="text-red">
            <div class="flex justify-center mb-4">
              <TriangleAlert class="h-12 w-12" />
            </div>
            <h3 class="mb-2 text-lg font-semibold">Failed to Load Lyrics</h3>
            <p class="text-sm opacity-80 max-w-md mx-auto">
              Unable to fetch lyrics data from the server.
            </p>
            <div class="mt-4">
              <button
                class="px-3 py-2 bg-red/20 hover:bg-red/30 rounded-lg transition-colors duration-200 text-sm"
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
