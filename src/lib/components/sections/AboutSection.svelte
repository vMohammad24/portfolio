<script lang="ts">
  import { viewport } from "$lib/utils/intersection";
  import { backOut } from "svelte/easing";
  import { fly } from "svelte/transition";
  interface Props {}

  let sectionElement: HTMLElement;
</script>

<section
  bind:this={sectionElement}
  id="about"
  class="transform rounded-xl bg-gradient-to-br from-base/80 to-surface0/40 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:shadow-blue/20 md:col-span-5"
  use:viewport.intersection
  class:animate-slide-up={$viewport.get(sectionElement)}
>
  <h2 class="relative mb-6 inline-block text-2xl font-bold text-text">
    About Me
    <span
      class="absolute bottom-0 left-0 h-1 w-0 bg-blue transition-all duration-500 group-hover:w-full"
    ></span>
  </h2>
  <div class="space-y-4">
    <p
      class="text-text-muted leading-relaxed"
      in:fly={{ y: 10, duration: 500, delay: 300, easing: backOut }}
    >
      Born on August 6th, 2009, in Jordan. I'm a student and full-stack
      developer looking to improve my skills each day.
    </p>
  </div>
</section>
