<script lang="ts">
  import { lanyardStore } from "$lib/states/lanyard";
  import type { Activity } from "$lib/types";
  import { backOut } from "svelte/easing";
  import { fade, fly } from "svelte/transition";
  interface Props {
    age: number;
    customStatus?: Activity;
  }

  let { age, customStatus }: Props = $props();

  let avatarDecoration = $derived(
    $lanyardStore?.discord_user.avatar_decoration_data
      ? `https://cdn.discordapp.com/avatar-decoration-presets/${$lanyardStore.discord_user.avatar_decoration_data.asset}.png?size=1024&passthrough=true`
      : null,
  );

  function typingEffect(
    node: HTMLElement,
    {
      text,
      speed = 50,
      delay = 0,
    }: { text: string; speed?: number; delay?: number },
  ) {
    const words = text.split(" ");
    let i = 0;
    let timer: NodeJS.Timeout;

    function type() {
      if (i < words.length) {
        const word = words[i];
        const span = document.createElement("span");
        span.textContent = (i > 0 ? " " : "") + word;
        span.className = "opacity-0 transform translate-y-2";
        setTimeout(() => {
          span.className =
            "opacity-100 transform translate-y-0 transition-all duration-500";
        }, 10);
        node.appendChild(span);
        i++;
        timer = setTimeout(type, speed);
      }
    }
    setTimeout(() => type(), delay);

    return {
      destroy() {
        clearTimeout(timer);
      },
    };
  }
</script>

<section
  id="header"
  class="hover:shadow-purple/20 relative overflow-hidden rounded-xl bg-gradient-to-r from-base/80 via-base/70 to-surface0/40 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500 md:col-span-12"
>
  <div class="relative z-10 flex flex-col items-center gap-8 md:flex-row">
    <div class="group relative" in:fade={{ duration: 600, delay: 300 }}>
      {#if $lanyardStore?.discord_user.avatar_decoration_data}
        <img
          class="pointer-events-none absolute z-20 h-36 w-36 animate-float rounded-full"
          src={avatarDecoration}
          alt="Avatar Decoration"
        />
      {/if}
      <img
        class="z-5 h-32 w-32 rounded-full border-2 border-surface0 object-cover shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:border-lavender"
        src={$lanyardStore?.discord_user
          ? `https://cdn.discordapp.com/avatars/${
              $lanyardStore.discord_user.id
            }/${$lanyardStore.discord_user.avatar}.webp?size=1024`
          : "https://cdn.discordapp.com/embed/avatars/0.png"}
        alt="Avatar"
        loading="eager"
      />
      <div
        class="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface0 bg-mantle"
      >
        <span
          class="h-3 w-3 rounded-full {$lanyardStore?.discord_status ===
          'online'
            ? 'animate-pulse bg-green'
            : $lanyardStore?.discord_status === 'idle'
              ? 'bg-yellow'
              : $lanyardStore?.discord_status === 'dnd'
                ? 'bg-red'
                : 'bg-surface0'}"
        ></span>
      </div>
    </div>
    <div class="text-center md:text-left">
      <h1
        class="mb-2 bg-gradient-to-r from-text to-subtext0 bg-clip-text text-5xl font-bold text-transparent"
        in:fly={{ y: 20, duration: 600, delay: 500, easing: backOut }}
      >
        Mohammad
      </h1>
      <div class="text-text-muted h-8 text-2xl font-medium">
        <span
          class="inline-block"
          in:fly={{ y: 20, duration: 600, delay: 700, easing: backOut }}
        >
          {age.toFixed(2)} years old
        </span>
      </div>

      <div
        class="text-text-muted mt-4 flex flex-wrap gap-1 border-l-2 border-lavender pl-3 text-lg"
        in:fly={{ y: 20, duration: 600, delay: 700, easing: backOut }}
        use:typingEffect={{
          text: "Full-stack developer with a passion for building basically anything and everything.",
          speed: 80,
          delay: 1200,
        }}
      ></div>
      <div class="mt-6 flex flex-wrap gap-3">
        <button
          class="rounded-md bg-lavender/80 px-5 py-2 font-medium text-crust transition-all duration-300 hover:-translate-y-1 hover:bg-lavender hover:shadow-md focus:outline-none focus:ring-2 focus:ring-lavender/50"
          in:fly={{ y: 20, duration: 500, delay: 1500, easing: backOut }}
          onclick={() => {
            window.scrollTo({
              top: document.getElementById("projects")?.offsetTop || 0,
              behavior: "smooth",
            });
          }}
        >
          View Projects
        </button>
        <button
          class="rounded-md bg-surface0/50 px-5 py-2 font-medium text-text transition-all duration-300 hover:-translate-y-1 hover:bg-surface0 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-surface0/50"
          in:fly={{ y: 20, duration: 500, delay: 1600, easing: backOut }}
          onclick={() => {
            window.scrollTo({
              top: document.getElementById("socials")?.offsetTop || 0,
              behavior: "smooth",
            });
          }}
        >
          Connect
        </button>
      </div>
    </div>
  </div>

  {#if customStatus}
    <div class="mx-auto mt-8 max-w-xl md:ml-48 md:mt-12">
      <div
        class="transform rounded-lg border-l-4 border-lavender bg-surface0/30 p-4 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lavender/20"
        in:fly={{ y: 20, duration: 500, delay: 1700, easing: backOut }}
      >
        <div class="flex items-center gap-3">
          <div class="h-3 w-3 animate-pulse rounded-full bg-lavender"></div>
          <p class="text-text-muted italic">{customStatus.state}</p>
        </div>
      </div>
    </div>
  {/if}
</section>
