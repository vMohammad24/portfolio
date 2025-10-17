<script lang="ts">
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
  import WatchingSection from "$lib/components/sections/WatchingSection.svelte";
  import { birthday } from "$lib/data/constants";
  import { lanyardStore } from "$lib/states/lanyard";
  import type { GitHubContributions, ProjectData } from "$lib/types";
  import { ArrowUp } from "@lucide/svelte";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  let age = $state(0);
  let currentTime = $state(Date.now());
  // let wakaTimeData: WakaTimeStats | null = $state(null);
  // let wakaTimeError: string | null = $state(null);
  let githubContributions: GitHubContributions | null = $state(null);
  let githubError: string | null = $state(null);
  const projects: ProjectData[] = $state([
    {
      name: "NaviThingy",
      description:
        "A Navidrome/Subsonic client for Desktop providing the best experience possible.",
      link: "https://github.com/vmohammad24/NaviThingy/",
      wakatimeName: "NaviThingy",
      logo: "https://raw.githubusercontent.com/vMohammad24/NaviThingy/refs/heads/main/static/logo.svg",
      techs: ["Tauri", "Svelte", "Bun", "Rust"],
    },
    {
      name: "Tidal Subsonic",
      description: `A translation layer for Tidal's API to make it compatible with Subsonic clients.`,
      link: "https://tidal.vmohammad.dev",
      wakatimeName: "tidal",
      logo: "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&size=64&url=https://tidal.com",
      techs: ["Bun", "Typescript", "SQLite", "Redis"],
    },
    {
      name: "Peekless",
      description:
        "An end to end encrypted search engine providing you with privacy and security.",
      link: "https://search.vmohammad.dev",
      wakatimeName: "peekless",
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
  const customStatus = $derived(
    $lanyardStore?.activities?.find((activity) => activity.type === 4)
  );
  const regularActivities = $derived(
    $lanyardStore?.activities?.filter((activity) => activity.type !== 4) || []
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

    fetchGitHubContributions()
      .then((data) => {
        githubContributions = data;
      })
      .catch((error) => {
        githubError = "Failed to load GitHub contributions";
        console.error(error);
      });

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

  const pain = `https://vmohammad.dev/embed?${encodeURIComponent(
    Array.from(crypto.getRandomValues(new Uint8Array(20)))
      .map((byte) => String.fromCharCode(33 + (byte % 94)))
      .join("")
  )}`;
</script>

<svelte:head>
  <meta property="og:image" content={pain} />
  <meta property="twitter:image:src" content={pain} />
</svelte:head>

<main class="relative min-h-screen overflow-hidden p-4 text-text md:p-8">
  <button
    class="fixed bottom-6 right-6 z-40 transform rounded-full bg-mauve/80 p-3 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-mauve"
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
    <LyricsSection bind:currentTime />
    <WatchingSection bind:currentTime />
    <ProjectsSection {projects} />
    <!-- <WakaTimeSection
      {wakaTimeData}
      {wakaTimeError}
      radius={50}
      strokeWidth={5}
      center={60}
    /> -->
    <GitHubSection {githubContributions} {githubError} />
    <SocialsSection />
    <FooterSection />
  </div>
</main>
