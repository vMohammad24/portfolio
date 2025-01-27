<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<div class="bg-base text-text">{@render children()}</div>
