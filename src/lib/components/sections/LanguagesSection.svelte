<script lang="ts">
  import { languages } from "$lib/data/constants";
  import { backOut } from "svelte/easing";
  import { fly } from "svelte/transition";
  interface Props {}
</script>

<section
  id="languages"
  class="transform rounded-xl bg-gradient-to-br from-base/80 to-surface0/40 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:shadow-yellow/20 md:col-span-8"
>
  <h2 class="group relative mb-6 inline-block text-2xl font-bold text-text">
    Programming Languages
    <span
      class="absolute bottom-0 left-0 h-1 w-0 bg-yellow transition-all duration-500 group-hover:w-full"
    ></span>
  </h2>
  <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
    {#each languages as lang, i}
      <div
        class="bg-base-dark/30 group rounded-lg p-4 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:bg-surface0/50 hover:shadow-md"
        in:fly={{
          y: 20,
          duration: 400,
          delay: 200 + i * 100,
          easing: backOut,
        }}
      >
        <div class="mb-3 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <img
              src={lang.icon}
              alt={lang.name}
              class="h-8 w-8 transition-transform duration-300 group-hover:rotate-12"
            />
            <a
              href={lang.link}
              target="_blank"
              rel="noopener noreferrer"
              class="text-lg text-text transition-colors duration-300 hover:text-blue"
            >
              {lang.name}
            </a>
          </div>
          <span class="text-text-muted font-medium">{lang.proficiency}%</span>
        </div>
        <div
          class="bg-base-dark/50 relative h-3 w-full overflow-hidden rounded-full"
        >
          <div
            class="absolute inset-0 bg-gradient-to-r from-blue to-lavender opacity-20"
          ></div>
          <div
            class="relative h-full rounded-full bg-gradient-to-r from-blue to-lavender opacity-70 transition-opacity duration-300 ease-out group-hover:opacity-100"
            style="width: {lang.proficiency}%; --proficiency: {lang.proficiency}%;"
          ></div>
        </div>
      </div>
    {/each}
  </div>
</section>
