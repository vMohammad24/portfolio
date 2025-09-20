<script lang="ts">
  import { viewport } from "$lib/utils/intersection";
  interface Props {}

  let sectionElement: HTMLElement;
</script>

<footer
  bind:this={sectionElement}
  id="footer"
  class="transform rounded-xl bg-gradient-to-br from-background/80 to-secondary/40 p-8 shadow-2xl backdrop-blur-xs transition-all duration-500 hover:shadow-purple/20 md:col-span-12"
  use:viewport.intersection
  class:animate-slide-up={$viewport.get(sectionElement)}
>
  <div class="text-gray flex flex-col items-center gap-4 text-center">
    <p>© {new Date().getFullYear()} vMohammad. All rights reserved.</p>
    <p>
      This website is open source on
      <a
        href="https://github.com/vMohammad24/portfolio"
        target="_blank"
        rel="noopener noreferrer"
        class="group relative inline-block text-gray transition-colors duration-300 hover:text-mauve"
      >
        GitHub
        <span
          class="absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 transform bg-mauve/30 transition-transform duration-300 group-hover:scale-x-100"
        ></span>
      </a>
    </p>
  </div>
</footer>
