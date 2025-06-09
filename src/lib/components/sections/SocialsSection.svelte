<script lang="ts">
  import { socials } from "$lib/data/constants";
  import { viewport } from "$lib/utils/intersection";
  import { backOut } from "svelte/easing";
  import { fly } from "svelte/transition";
  interface Props {}

  let sectionElement: HTMLElement;
</script>

<section
  bind:this={sectionElement}
  id="socials"
  class="transform rounded-xl bg-gradient-to-br from-base/80 to-surface0/40 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:shadow-mauve/20 md:col-span-12"
  use:viewport.intersection
  class:animate-slide-up={$viewport.get(sectionElement)}
>
  <h2 class="group relative mb-6 inline-block text-2xl font-bold text-text">
    My Socials
    <span
      class="absolute bottom-0 left-0 h-1 w-0 bg-mauve transition-all duration-500 group-hover:w-full"
    ></span>
  </h2>

  <div
    class="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5"
    in:fly={{ y: 15, duration: 400, delay: 200, easing: backOut }}
  >
    {#each socials as social}
      <a
        href={social.link}
        target="_blank"
        rel="noopener noreferrer"
        class="flex flex-col items-center gap-3 rounded-md p-5 text-white shadow-lg transition-all duration-300 hover:scale-105"
        style="background: linear-gradient(to right, {social.gradientFrom}, {social.gradientTo});"
      >
        <div class="relative">
          <img
            src={social.icon}
            alt={social.name}
            class="h-8 w-8 transition-transform duration-500 group-hover:scale-110"
            style="filter: brightness(0) invert(1);"
          />
        </div>
        <span>{social.name}</span>
      </a>
    {/each}
  </div>
</section>
