<script lang="ts">
  import { prepareChartData } from "$lib/client/wakatime";
  import type { WakaTimeStats } from "$lib/types";
  import { ChevronDown } from "@lucide/svelte";
  import { backOut } from "svelte/easing";
  import { fade, fly } from "svelte/transition";
  interface Props {
    wakaTimeData?: WakaTimeStats | null;
    wakaTimeError: string | null;
    radius: number;
    strokeWidth: number;
    center: number;
  }

  let { wakaTimeData, wakaTimeError, radius, strokeWidth, center }: Props =
    $props();

  function calculateStrokeDashArray(percent: number, radius: number): string {
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = `${(percent * circumference) / 100} ${circumference}`;
    return strokeDasharray;
  }
</script>

<section
  id="wakatime"
  class="transform rounded-xl bg-gradient-to-br from-base/80 to-surface0/40 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:shadow-red/20 md:col-span-12"
>
  <h2 class="group relative mb-6 inline-block text-2xl font-bold text-text">
    Alltime Coding Stats
    <span
      class="absolute bottom-0 left-0 h-1 w-0 bg-red transition-all duration-500 group-hover:w-full"
    ></span>
  </h2>
  {#if wakaTimeError}
    <p class="text-center text-red">{wakaTimeError}</p>
  {/if}
  {#if wakaTimeData}
    {@const chartData = prepareChartData(wakaTimeData.data.languages)}
    <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div class="rounded-lg bg-surface0/20 px-4 py-3 backdrop-blur-sm">
        <span class="text-text-muted block text-sm">Total Coding Time</span>
        <span class="text-2xl font-bold text-red"
          >{wakaTimeData.data.human_readable_total}</span
        >
      </div>
      <div class="flex flex-wrap gap-4">
        <div class="rounded-lg bg-surface0/20 px-4 py-3 backdrop-blur-sm">
          <span class="text-text-muted block text-sm">Daily Average</span>
          <span class="font-medium"
            >{wakaTimeData.data.human_readable_daily_average}</span
          >
        </div>
        <div class="rounded-lg bg-surface0/20 px-4 py-3 backdrop-blur-sm">
          <span class="text-text-muted block text-sm">Range</span>
          <span class="font-medium"
            >{wakaTimeData.data.human_readable_range}</span
          >
        </div>
      </div>
    </div>

    <div
      class="grid grid-cols-1 items-start gap-8 md:grid-cols-2"
      in:fade={{ duration: 800 }}
    >
      <div class="relative">
        <svg
          viewBox="0 0 120 120"
          class="mx-auto w-full max-w-md -rotate-90 transform transition-transform duration-1000 hover:rotate-0"
        >
          {#each chartData.segments as segment, i}
            {@const offset = chartData.segments
              .slice(0, i)
              .reduce((acc, s) => acc + s.percent, 0)}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={segment.color}
              stroke-width={strokeWidth}
              stroke-dasharray={calculateStrokeDashArray(
                segment.percent,
                radius,
              )}
              stroke-dashoffset={-((offset * 2 * Math.PI * radius) / 100)}
              class="transition-all duration-1000"
            />
          {/each}
        </svg>
        <div class="absolute inset-0 flex items-center justify-center">
          <div
            class="flex h-28 w-28 transform flex-col items-center justify-center rounded-full bg-base/60 text-center backdrop-blur-sm transition-transform duration-500 hover:scale-110"
          >
            <p class="text-2xl font-bold">{chartData.totalTime}</p>
            <p class="text-text-muted text-xs">Total Coding Time</p>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-5">
        <div class="grid grid-cols-2 gap-4">
          {#each chartData.segments.slice(0, 6) as segment, i}
            <div
              class="flex transform items-center gap-3 rounded-lg bg-surface0/30 p-3 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-surface0/60 hover:shadow-md"
              in:fly={{
                y: 15,
                duration: 400,
                delay: 300 + i * 100,
                easing: backOut,
              }}
            >
              <div
                class="h-4 w-4 rounded-full"
                style="background-color: {segment.color}"
              ></div>
              <div class="min-w-0 flex-1">
                <p class="truncate font-medium">{segment.name}</p>
                <div class="text-text-muted flex justify-between text-sm">
                  <span>{segment.text}</span>
                  <span class="text-xs">{segment.percent.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          {/each}
        </div>

        {#if wakaTimeData.data.languages.length > 6}
          <details class="group">
            <summary
              class="text-text-muted cursor-pointer list-none text-sm hover:text-text"
            >
              <span class="flex items-center gap-1">
                <ChevronDown
                  class="h-4 w-4 transition-transform duration-300 group-open:-rotate-180"
                />
                Show all {wakaTimeData.data.languages.length} languages
              </span>
            </summary>
            <div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {#each wakaTimeData.data.languages.slice(6) as lang, i}
                <div
                  class="flex items-center gap-2 rounded bg-surface0/20 p-2"
                  in:fly={{
                    y: 10,
                    duration: 300,
                    delay: 100 + i * 50,
                    easing: backOut,
                  }}
                >
                  <div
                    class="h-3 w-3 rounded-full"
                    style="background-color: {lang.color || '#ccc'}"
                  ></div>
                  <span class="truncate text-sm">{lang.name}</span>
                  <span
                    class="text-text-muted ml-auto whitespace-nowrap text-xs"
                    >{lang.text}</span
                  >
                </div>
              {/each}
            </div>
          </details>
        {/if}
      </div>
    </div>

    {#if wakaTimeData.data.projects && wakaTimeData.data.projects.length > 0}
      <div class="mt-8 border-t border-surface0/30 pt-6">
        <h3 class="mb-4 text-xl font-medium">Project Distribution</h3>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {#each wakaTimeData.data.projects.slice(0, 9) as project, i}
            <div
              class="flex items-center justify-between rounded-lg bg-surface0/20 p-3 transition-all duration-300 hover:-translate-y-1 hover:bg-surface0/40"
              in:fly={{
                y: 10,
                duration: 300,
                delay: 100 + i * 75,
                easing: backOut,
              }}
            >
              <div class="flex items-center gap-3">
                <div
                  class="flex h-8 w-8 items-center justify-center rounded-md bg-base/70"
                >
                  <span class="text-xs font-bold"
                    >{project.name.substring(0, 2).toUpperCase()}</span
                  >
                </div>
                <div>
                  <p class="max-w-[150px] truncate font-medium">
                    {project.name}
                  </p>
                  <p class="text-text-muted text-xs">{project.text}</p>
                </div>
              </div>
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full bg-red/10 text-xs font-medium text-red"
              >
                {project.percent.toFixed(0)}%
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  {/if}
</section>
