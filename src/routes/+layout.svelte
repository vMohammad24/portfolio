<script lang="ts">
  import { dev } from "$app/environment";
  import "../app.css";
  const { children } = $props();
</script>

<div class="bg-base text-text">{@render children()}</div>

<svelte:head>
  {#if !dev}
    <script
      src="https://tracking.vmohammad.dev/api/script.js"
      data-site-id="1"
      defer
    ></script>
  {/if}
</svelte:head>
