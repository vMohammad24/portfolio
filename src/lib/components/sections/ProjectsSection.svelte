<script lang="ts">
  import type { ProjectData } from "$lib/types";
  import { ArrowRight, ExternalLink } from "@lucide/svelte";
  import { backOut } from "svelte/easing";
  import { fly } from "svelte/transition";
  interface Props {
    projects: ProjectData[];
  }

  let { projects }: Props = $props();
</script>

<section
  id="projects"
  class="transform rounded-xl bg-gradient-to-br from-base/80 to-surface0/40 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:shadow-teal/20 md:col-span-12"
>
  <h2 class="group relative mb-6 inline-block text-2xl font-bold text-text">
    My Projects
    <span
      class="absolute bottom-0 left-0 h-1 w-0 bg-teal transition-all duration-500 group-hover:w-full"
    ></span>
  </h2>

  <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
    {#each projects as project, i}
      <div
        class="bg-base-dark/30 group relative h-full overflow-hidden rounded-lg p-6 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:bg-surface0/50 hover:shadow-md"
        in:fly={{
          y: 20,
          duration: 400,
          delay: 200 + i * 150,
          easing: backOut,
        }}
      >
        <div
          class="pointer-events-none absolute inset-0 bg-gradient-to-br from-teal/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        ></div>

        <div class="mb-4 flex items-center gap-4">
          <div class="relative">
            <div
              class="absolute inset-0 rounded-md bg-gradient-to-br from-teal/40 to-blue/40 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100"
            ></div>
            <img
              src={project.logo ??
                "https://raw.githubusercontent.com/devicons/devicon/refs/tags/v2.16.0/icons/github/github-original.svg"}
              alt={project.name}
              class="relative h-12 w-12 rounded-md bg-base/50 object-cover p-1 transition-transform duration-300 group-hover:rotate-6"
            />
          </div>
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            class="text-xl font-medium text-text transition-colors duration-300 hover:text-teal"
          >
            {project.name}
          </a>

          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            class="ml-auto rounded-full bg-surface0/50 p-2 opacity-0 transition-opacity duration-300 hover:bg-teal/70 hover:text-crust group-hover:opacity-100"
            aria-label="View project"
          >
            <ExternalLink class="h-5 w-5" />
          </a>
        </div>

        <p class="text-text-muted mb-4 min-h-[60px]">
          {project.description}
        </p>

        <div class="mb-4 flex flex-wrap gap-2">
          {#each project.techs || [] as tech}
            <span class="rounded-full bg-mantle/50 px-2 py-1 text-xs"
              >{tech}</span
            >
          {/each}
        </div>

        {#if project.wakatimeStats}
          <div
            class="mt-auto flex items-center gap-2 rounded-lg bg-surface0/20 p-3 transition-colors duration-300 group-hover:bg-surface0/40"
          >
            <div class="h-3 w-3 animate-pulse rounded-full bg-teal"></div>
            <span class="text-text-muted text-sm">
              Coding time: <span class="font-medium text-teal"
                >{project.wakatimeStats.text}</span
              >
              <span class="ml-1 text-xs opacity-70"
                >({project.wakatimeStats.percent.toFixed(1)}%)</span
              >
            </span>
          </div>
        {:else if project.wakatimeName}
          <div
            class="mt-auto flex items-center gap-2 rounded-lg bg-surface0/20 p-3"
          >
            <div class="h-3 w-3 animate-pulse rounded-full bg-surface0"></div>
            <span class="text-text-muted text-sm"
              >Loading WakaTime stats...</span
            >
          </div>
        {/if}
      </div>
    {/each}
  </div>

  <div class="mt-8 flex justify-center">
    <a
      href="https://github.com/vMohammad24"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex items-center gap-2 rounded-lg bg-surface0/40 px-6 py-3 transition-all duration-300 hover:-translate-y-1 hover:bg-teal/70 hover:text-crust focus:outline-none focus:ring-2 focus:ring-teal/50"
    >
      <span>More Projects on GitHub</span>
      <ArrowRight class="h-5 w-5" />
    </a>
  </div>
</section>
