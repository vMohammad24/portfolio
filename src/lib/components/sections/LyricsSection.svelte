<script lang="ts">
  import { lanyardStore } from "$lib/states/lanyard";
  import type { EnhancedLyricsResponse } from "$lib/types";
  import { viewport } from "$lib/utils/intersection";
  import { Music2, Pause, Play } from "@lucide/svelte";
  import { fade } from "svelte/transition";

  interface Props {
    currentTime: number;
  }

  interface SongData {
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
    length?: number;
  }

  interface AudioState {
    element: HTMLAudioElement | undefined;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    isLoading: boolean;
  }

  let { currentTime = $bindable(0) }: Props = $props();

  const rawSong = $derived.by(() => {
    const spotify = $lanyardStore?.spotify;
    if (spotify) {
      return { song: spotify.song, artist: spotify.artist };
    }

    const musicActivity = $lanyardStore?.activities?.find(
      (activity) => activity.type === 2
    );

    if (musicActivity) {
      return {
        song: musicActivity.details,
        artist: musicActivity.state.split(",")[0],
      };
    }

    return null;
  });

  const songStartTime = $derived.by(() => {
    const spotify = $lanyardStore?.spotify;
    if (spotify?.timestamps?.start) {
      return spotify.timestamps.start;
    }

    const musicActivity = $lanyardStore?.activities?.find(
      (activity) => activity.type === 2
    );
    return musicActivity?.timestamps?.start || null;
  });

  let songDataCache = $state<Record<string, Promise<SongData | null>>>({});
  let lyricsCache = $state<
    Record<string, Promise<EnhancedLyricsResponse | null>>
  >({});

  let currentSongData = $state<SongData | null>(null);
  let currentLyricsData = $state<EnhancedLyricsResponse | null>(null);

  let audioState = $state<AudioState>({
    element: undefined,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    isLoading: false,
  });

  let lyricsSync = $state({
    currentLineIndex: -1,
    currentWordIndex: -1,
    container: undefined as HTMLElement | undefined,
    currentElement: undefined as HTMLElement | undefined,
  });

  let sectionElement = $state<HTMLElement>();

  function createFallbackSongData(song: string, artist: string): SongData {
    return {
      song,
      artist,
      previewUrl: null,
      artwork: null,
      albumName: "",
      releaseDate: null,
      length: 0,
    };
  }

  function parseArtworkData(artwork: any): SongData["artwork"] {
    if (!artwork) return null;

    return {
      url: artwork.url.replace("{w}x{h}", "300x300"),
      bgColor: artwork.bgColor || "0d0f0e",
      textColor1: artwork.textColor1 || "f9f4ef",
      textColor2: artwork.textColor2 || "e1b235",
    };
  }

  function parseSongResponse(song: any, isSpotifySource: boolean): SongData {
    const songName = song.attributes.name;
    const rawArtist = song.attributes.artistName;

    const cleanArtist = rawArtist.includes("&")
      ? rawArtist.split("&")[0].trim()
      : rawArtist;

    return {
      song: songName,
      artist: cleanArtist,
      releaseDate: song.attributes.releaseDate || null,
      previewUrl: song.attributes?.previews?.[0]?.url || null,
      artwork: parseArtworkData(song.attributes?.artwork),
      albumName: song.attributes?.albumName || "",
      length: song.attributes?.durationInMillis
        ? song.attributes.durationInMillis / 1000
        : undefined,
    };
  }

  async function fetchSongData(
    song: string,
    artist: string
  ): Promise<SongData | null> {
    const searchQuery = `${encodeURIComponent(song)} ${encodeURIComponent(artist)}`;
    const apiUrl = `https://api.vmohammad.dev/apple/search?q=${searchQuery}`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        return createFallbackSongData(song, artist);
      }

      const data = await response.json();
      const songResult = data?.results?.song?.data?.[0];

      if (songResult) {
        const isSpotifySource = !!$lanyardStore?.spotify;
        return parseSongResponse(songResult, isSpotifySource);
      }

      return createFallbackSongData(song, artist);
    } catch (error) {
      console.error("Failed to fetch song data:", error);
      return createFallbackSongData(song, artist);
    }
  }

  async function fetchLyrics(
    song: string,
    artist: string,
    length?: number
  ): Promise<EnhancedLyricsResponse | null> {
    const lengthParam = length ? `&length=${Math.round(length)}` : "";
    const apiUrl = `https://api.vmohammad.dev/lyrics?track=${encodeURIComponent(song)}&artist=${encodeURIComponent(artist)}${lengthParam}`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) return null;

      const data = await response.json();
      return data?.enhancedLyrics ? data : null;
    } catch (error) {
      console.error("Failed to fetch lyrics:", error);
      return null;
    }
  }

  function getElapsedTime(startTimestamp: number): number {
    return Math.max(0, (currentTime - startTimestamp) / 1000);
  }

  function isWordActive(
    wordTime: number,
    wordEndTime: number,
    songStart: number
  ): boolean {
    const elapsed = getElapsedTime(songStart);
    return elapsed >= wordTime && elapsed < wordEndTime;
  }

  function isLineActive(
    lineTime: number,
    nextLineTime: number | null,
    songStart: number
  ): boolean {
    const elapsed = getElapsedTime(songStart);
    const lineEnd = nextLineTime || lineTime + 5;
    return elapsed >= lineTime && elapsed < lineEnd;
  }

  function updateLyricsSync() {
    if (!songStartTime || !currentLyricsData?.enhancedLyrics) {
      lyricsSync.currentLineIndex = -1;
      lyricsSync.currentWordIndex = -1;
      return;
    }

    const lyrics = currentLyricsData.enhancedLyrics;
    let activeLineIndex = -1;

    for (let i = 0; i < lyrics.length; i++) {
      const line = lyrics[i];
      const nextLine = lyrics[i + 1];

      if (isLineActive(line.time, nextLine?.time || null, songStartTime)) {
        activeLineIndex = i;
        break;
      }
    }

    lyricsSync.currentLineIndex = activeLineIndex;

    if (activeLineIndex >= 0) {
      const currentLine = lyrics[activeLineIndex];
      let activeWordIndex = -1;

      if (currentLine.words) {
        for (let i = 0; i < currentLine.words.length; i++) {
          const word = currentLine.words[i];
          if (isWordActive(word.time, word.endTime, songStartTime)) {
            activeWordIndex = i;
            break;
          }
        }
      }

      lyricsSync.currentWordIndex = activeWordIndex;
    } else {
      lyricsSync.currentWordIndex = -1;
    }
  }

  function scrollToCurrentLyric() {
    const { container, currentElement } = lyricsSync;

    if (
      !container ||
      !currentElement ||
      !currentLyricsData?.enhancedLyrics?.length
    ) {
      return;
    }

    try {
      const containerHeight = container.clientHeight;
      const lyricTop = currentElement.offsetTop;
      const lyricHeight = currentElement.clientHeight;

      container.scrollTo({
        top: lyricTop - containerHeight / 2 + lyricHeight / 2,
        behavior: "smooth",
      });
    } catch (error) {
      console.warn("Failed to scroll to current lyric:", error);
    }
  }

  function togglePlayback() {
    if (!audioState.element) return;

    if (audioState.isPlaying) {
      audioState.element.pause();
    } else {
      audioState.isLoading = true;
      audioState.element.play().catch(console.error);
    }
  }

  function seekTo(event: MouseEvent) {
    if (!audioState.element || !audioState.duration) return;

    const progressBar = event.currentTarget as HTMLElement;
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = (event.clientX - rect.left) / rect.width;
    const newTime = clickPosition * audioState.duration;

    audioState.element.currentTime = newTime;
  }

  const audioHandlers = {
    onTimeUpdate: () => {
      if (audioState.element) {
        audioState.currentTime = audioState.element.currentTime;
      }
    },
    onLoadedMetadata: () => {
      if (audioState.element) {
        audioState.duration = audioState.element.duration;
      }
    },
    onPlay: () => {
      audioState.isPlaying = true;
      audioState.isLoading = false;
    },
    onPause: () => {
      audioState.isPlaying = false;
      audioState.isLoading = false;
    },
    onLoadStart: () => {
      audioState.isLoading = true;
    },
    onCanPlay: () => {
      audioState.isLoading = false;
    },
  };

  $effect(() => {
    if (!rawSong) {
      currentSongData = null;
      currentLyricsData = null;
      return;
    }

    const cacheKey = `${rawSong.song}|${rawSong.artist}`;

    if (!songDataCache[cacheKey]) {
      songDataCache[cacheKey] = fetchSongData(rawSong.song, rawSong.artist);
    }

    songDataCache[cacheKey].then((data) => {
      currentSongData = data;
    });
  });

  $effect(() => {
    if (!currentSongData) {
      currentLyricsData = null;
      return;
    }

    const cacheKey = `${currentSongData.song}|${currentSongData.artist}|${currentSongData.length || 0}`;

    if (!lyricsCache[cacheKey]) {
      lyricsCache[cacheKey] = fetchLyrics(
        currentSongData.song,
        currentSongData.artist,
        currentSongData.length
      );
    }

    lyricsCache[cacheKey].then((data) => {
      currentLyricsData = data;
    });
  });

  $effect(() => {
    updateLyricsSync();
  });

  $effect(() => {
    if (lyricsSync.currentElement && lyricsSync.container) {
      scrollToCurrentLyric();
    }
  });
</script>

{#if rawSong}
  <section
    bind:this={sectionElement}
    id="lyrics"
    class="transform rounded-xl bg-primary/90 p-6 shadow-lg backdrop-blur-md transition-all duration-300 md:col-span-12 border border-secondary/30"
    use:viewport.intersection
    class:animate-slide-up={sectionElement
      ? $viewport.get(sectionElement)
      : false}
  >
    <div class="relative">
      <div class="mb-6">
        <h2 class="mb-4 inline-block text-xl font-bold text-white">
          <Music2 class="inline-block mr-2 h-6 w-6 text-blue" />
          Now Playing
        </h2>

        {#if currentSongData}
          <div class="space-y-2">
            <h3 class="text-lg font-semibold text-white leading-tight">
              {currentSongData.song} by {currentSongData.artist}
            </h3>
          </div>

          {#if currentSongData.previewUrl && currentSongData.artwork}
            <div
              class="mt-4 p-3 rounded-lg border border-secondary/30 bg-secondary/10"
            >
              <div class="flex items-center gap-3">
                <img
                  src={currentSongData.artwork.url}
                  alt="Album artwork"
                  class="w-12 h-12 rounded-md object-cover"
                />

                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-white truncate">
                    {currentSongData.song}
                  </p>
                  <p class="text-xs text-gray truncate">
                    {currentSongData.artist}
                    {#if currentSongData.releaseDate}<span
                        class="text-opacity-50"
                      >
                        •
                        {new Date(
                          currentSongData.releaseDate
                        ).getFullYear()}</span
                      >{/if}
                  </p>
                </div>

                <button
                  onclick={togglePlayback}
                  disabled={audioState.isLoading}
                  class="flex items-center justify-center w-10 h-10 rounded-full bg-blue/20 hover:bg-blue/30 border border-blue/40 transition-all duration-200 disabled:opacity-50"
                >
                  {#if audioState.isLoading}
                    <div
                      class="w-4 h-4 border-2 border-blue border-t-transparent rounded-full animate-spin"
                    ></div>
                  {:else if audioState.isPlaying}
                    <Pause class="w-4 h-4 text-blue" />
                  {:else}
                    <Play class="w-4 h-4 ml-0.5 text-blue" />
                  {/if}
                </button>
              </div>

              {#if audioState.duration > 0}
                <div class="mt-3">
                  <button
                    type="button"
                    class="w-full h-2 rounded-full cursor-pointer bg-secondary/40 overflow-hidden"
                    aria-label="Seek audio"
                    onclick={seekTo}
                  >
                    <div
                      class="h-full bg-blue transition-all duration-200"
                      style="width: {(audioState.currentTime /
                        audioState.duration) *
                        100}%;"
                    ></div>
                  </button>
                  <div class="flex justify-between mt-1 text-xs text-gray">
                    <span>{Math.floor(audioState.currentTime)}s</span>
                    <span>{Math.round(audioState.duration)}s</span>
                  </div>
                </div>
              {/if}

              <audio
                bind:this={audioState.element}
                src={currentSongData.previewUrl}
                ontimeupdate={audioHandlers.onTimeUpdate}
                onloadedmetadata={audioHandlers.onLoadedMetadata}
                onplay={audioHandlers.onPlay}
                onpause={audioHandlers.onPause}
                onloadstart={audioHandlers.onLoadStart}
                oncanplay={audioHandlers.onCanPlay}
                preload="metadata"
              ></audio>
            </div>
          {/if}
        {:else}
          <div class="space-y-2">
            <div class="h-6 bg-secondary/30 rounded-sm animate-pulse"></div>
            <div
              class="h-4 bg-secondary/20 rounded-sm animate-pulse w-2/3"
            ></div>
          </div>
        {/if}
      </div>
      {#if currentLyricsData === null}
        <div
          class="flex items-center justify-center p-12"
          in:fade={{ duration: 400 }}
        >
          <div class="flex flex-col items-center gap-3">
            <div
              class="h-6 w-6 animate-spin rounded-full border-2 border-blue/30 border-t-blue"
            ></div>
            <span class="text-gray">Loading lyrics...</span>
          </div>
        </div>
      {:else if currentLyricsData?.enhancedLyrics?.length}
        <div
          class="flex-1 overflow-y-auto p-4 scrollbar-none max-h-112 rounded-xl bg-secondary/30 backdrop-blur-xs border border-secondary/20 shadow-inner scroll-smooth lyrics-container"
          bind:this={lyricsSync.container}
        >
          <div class="flex flex-col gap-6 pb-8">
            {#each currentLyricsData.enhancedLyrics as line, i}
              {#if i === lyricsSync.currentLineIndex}
                <div
                  class="text-2xl leading-relaxed min-h-[60px] p-5 rounded-xl shadow-lg transform transition-all duration-300"
                  bind:this={lyricsSync.currentElement}
                  in:fade={{
                    duration: 300,
                  }}
                >
                  {#if line.words && line.words.length > 0}
                    {#each line.words as word, wordIndex}
                      {#if word.isParenthetical}
                        <span
                          class="inline-block mr-1 opacity-70 text-gray font-light italic transition-all duration-300 ease-out hover:text-blue/80 cursor-pointer {wordIndex ===
                          lyricsSync.currentWordIndex
                            ? 'text-blue scale-105'
                            : 'scale-100'}"
                        >
                          {word.word}
                        </span>
                      {:else}
                        <span
                          class="inline-block mr-1 transition-all duration-300 ease-out hover:text-blue cursor-pointer
                            {wordIndex <= lyricsSync.currentWordIndex
                            ? 'text-blue'
                            : ''}
                            {wordIndex === lyricsSync.currentWordIndex
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
                           {i < lyricsSync.currentLineIndex
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
          class="text-center p-8 rounded-lg bg-secondary/20 border border-secondary/20"
          in:fade={{ duration: 400 }}
        >
          <div class="text-gray">
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
