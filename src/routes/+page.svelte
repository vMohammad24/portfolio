<script lang="ts">
  import {
    extractProjectStats,
    fetchWakaTimeStats,
  } from "$lib/client/wakatime";
  import Background from "$lib/components/Background.svelte";
  import AboutSection from "$lib/components/sections/AboutSection.svelte";
  import ActivitiesSection from "$lib/components/sections/ActivitiesSection.svelte";
  import FooterSection from "$lib/components/sections/FooterSection.svelte";
  import GitHubSection from "$lib/components/sections/GitHubSection.svelte";
  import HeroSection from "$lib/components/sections/HeroSection.svelte";
  import LanguagesSection from "$lib/components/sections/LanguagesSection.svelte";
  import LyricsSection from "$lib/components/sections/LyricsSection.svelte";
  import ProjectsSection from "$lib/components/sections/ProjectsSection.svelte";
  import SkillsSection from "$lib/components/sections/SkillsSection.svelte";
  import SocialsSection from "$lib/components/sections/SocialsSection.svelte";
  import WakaTimeSection from "$lib/components/sections/WakaTimeSection.svelte";
  import { birthday } from "$lib/data/constants";
  import { lanyardStore } from "$lib/states/lanyard";
  import type {
    GitHubContributions,
    ProjectData,
    WakaTimeStats,
  } from "$lib/types";
  import { ArrowUp } from "@lucide/svelte";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  let age = $state(0);
  let currentTime = $state(Date.now());
  let wakaTimeData: WakaTimeStats | null = $state(null);
  let wakaTimeError: string | null = $state(null);
  let githubContributions: GitHubContributions | null = $state(null);
  let githubError: string | null = $state(null);
  let projects: ProjectData[] = $state([
    {
      name: "NaviThingy",
      description:
        "A Navidrome/Subsonic client for Desktop providing the best experience possible.",
      link: "https://github.com/vmohammad24/NaviThingy/",
      wakatimeName: "NaviThingy",
      wakatimeStats: null,
      logo: "https://raw.githubusercontent.com/vMohammad24/NaviThingy/refs/heads/main/static/logo.svg",
      techs: ["Tauri", "Svelte", "Bun", "Rust"],
    },
    {
      name: "Tidal Subsonic",
      description: `A translation layer for Tidal's API to make it compatible with Subsonic clients.`,
      link: "https://tidal.vmohammad.dev",
      wakatimeName: "tidal",
      wakatimeStats: null,
      logo: "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&size=64&url=https://tidal.com",
      techs: ["Bun", "Typescript", "SQLite", "Redis"],
    },
    {
      name: "Peekless",
      description:
        "An end to end encrypted search engine providing you with privacy and security.",
      link: "https://search.vmohammad.dev",
      wakatimeName: "peekless",
      wakatimeStats: null,
      logo: "https://search.vmohammad.dev/public/img/favicon.svg",
      techs: ["Bun", "TypeScript", "Redis"],
    },
  ]);

  async function fetchGitHubContributions() {
    try {
      const response = await fetch("/github");
      if (!response.ok) {
        throw new Error("Failed to fetch GitHub contributions");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching GitHub contributions:", error);
      throw error;
    }
  }
  let customStatus = $derived(
    $lanyardStore?.activities?.find((activity) => activity.type === 4),
  );
  let regularActivities = $derived(
    $lanyardStore?.activities?.filter((activity) => activity.type !== 4) || [],
  );
  let showBackToTop = $state(false);

  onMount(() => {
    const updateAge = () => {
      const now = new Date();
      const diff = now.getTime() - birthday.getTime();
      age = diff / (1000 * 60 * 60 * 24 * 365.25);
    };

    updateAge();
    const interval = setInterval(updateAge, 5000);

    const timeInterval = setInterval(() => {
      currentTime = Date.now();
    }, 250);

    try {
      (async () => {
        [wakaTimeData, githubContributions] = await Promise.all([
          fetchWakaTimeStats(),
          fetchGitHubContributions(),
        ]);
        if (wakaTimeData?.data?.projects) {
          const wakatimeProjectNames = projects
            .filter((p) => p.wakatimeName)
            .map((p) => p.wakatimeName as string);

          const projectStats = extractProjectStats(
            wakaTimeData,
            wakatimeProjectNames,
          );

          projects = projects.map((project) => {
            if (project.wakatimeName && projectStats[project.wakatimeName]) {
              return {
                ...project,
                wakatimeStats: projectStats[project.wakatimeName],
              };
            }
            return project;
          });
        }
      })();
    } catch (error) {
      wakaTimeError = "Failed to load WakaTime stats";
      githubError = "Failed to load GitHub contributions";
    }

    const handleScroll = () => {
      showBackToTop = window.scrollY > 500;
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
      window.removeEventListener("scroll", handleScroll);
    };
  });

  const pain = `https://vmohammad.dev/avatar?${encodeURIComponent(
    Array.from(crypto.getRandomValues(new Uint8Array(20)))
      .map((byte) => String.fromCharCode(33 + (byte % 94)))
      .join(""),
  )}`;
</script>

<svelte:head>
  <meta property="og:image" content={pain} />
  <meta property="twitter:image:src" content={pain} />
</svelte:head>

<main
  class="relative min-h-screen overflow-hidden bg-gradient-to-br from-base to-crust p-4 text-text md:p-8"
>
  <div class="fixed inset-0 z-0 opacity-20">
    <Background particleCount={40} />
  </div>
  <button
    class="fixed bottom-6 right-6 z-40 transform rounded-full bg-lavender/80 p-3 text-crust shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-lavender"
    style="opacity: {showBackToTop ? '1' : '0'}; pointer-events: {showBackToTop
      ? 'auto'
      : 'none'}; transform: scale({showBackToTop ? '1' : '0.8'});"
    onclick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    aria-label="Back to top"
  >
    <ArrowUp class="h-6 w-6" />
  </button>

  <div
    class="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-12"
    in:fade={{ duration: 1000, delay: 200 }}
  >
    <HeroSection {age} {customStatus} />
    <AboutSection />
    <ActivitiesSection {regularActivities} {currentTime} />
    <LanguagesSection />
    <SkillsSection />
    <LyricsSection {currentTime} />
    <ProjectsSection {projects} />
    <WakaTimeSection
      {wakaTimeData}
      {wakaTimeError}
      radius={50}
      strokeWidth={5}
      center={60}
    />
    <GitHubSection {githubContributions} {githubError} />
    <SocialsSection />
    <FooterSection />
  </div>
</main>
