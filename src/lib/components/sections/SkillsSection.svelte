<script lang="ts">
  import { skills } from "$lib/data/constants";
  import { viewport } from "$lib/utils/intersection";
  import { elasticOut } from "svelte/easing";
  import { fly } from "svelte/transition";
  interface Props {}

  let sectionElement: HTMLElement;
</script>

<section
  bind:this={sectionElement}
  id="skills"
  class="transform rounded-xl bg-gradient-to-br from-base/80 to-surface0/40 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:shadow-pink/20 md:col-span-4"
  use:viewport.intersection
  class:animate-slide-up={$viewport.get(sectionElement)}
>
  <h2 class="group relative mb-6 inline-block text-2xl font-bold text-text">
    Skills
    <span
      class="absolute bottom-0 left-0 h-1 w-0 bg-pink transition-all duration-500 group-hover:w-full"
    ></span>
  </h2>
  <div class="grid grid-cols-2 gap-4">
    {#each skills as skill, i}
      <a
        href={skill.link}
        target="_blank"
        rel="noopener noreferrer"
        class="bg-base-dark/50 group flex flex-col items-center gap-2 rounded-lg p-4
								transition-all duration-300 hover:scale-105 hover:bg-mantle hover:shadow-lg
                                focus:outline-none focus:ring-2 focus:ring-pink/50"
        in:fly={{
          y: 15,
          x: 5,
          duration: 400,
          delay: 100 + i * 75,
          easing: elasticOut,
        }}
      >
        <div class="relative">
          <img
            src={skill.icon}
            alt={skill.name}
            class="h-10 w-10 transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <span
          class="text-center text-sm font-medium transition-colors duration-300 group-hover:text-pink"
          >{skill.name}</span
        >
      </a>
    {/each}
  </div>

  <div class="mt-8 border-t border-surface0/30 pt-4">
    <h3 class="mb-3 text-lg font-medium text-pink/80">Currently Learning</h3>
    <div class="flex flex-wrap gap-2">
      {#each ["Rust"] as skill, i}
        <span class="rounded-full bg-mantle/50 px-2 py-1 text-xs">{skill}</span>
      {/each}
    </div>
  </div>
</section>
