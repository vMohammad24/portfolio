<script lang="ts">
  import "../app.css";
  const { children } = $props();
</script>

<div class="bg-base text-text">{@render children()}</div>
