<script lang="ts">
  import Background from "$lib/components/Background.svelte";
  import "../app.css";
  const { children } = $props();
</script>

<div class="min-h-screen flex flex-col">
  <Background className="bg-gradient-to-br from-primary to-background" />
  <main class="text-text flex-grow">
    {@render children()}
  </main>
</div>
