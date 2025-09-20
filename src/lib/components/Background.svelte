<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  interface Props {
    particleCount?: number;
    colors?: string[];
    speed?: number;
    size?: { min: number; max: number };
    opacity?: { min: number; max: number };
    className?: string;
  }

  let {
    particleCount = 10,
    colors = ["#89B4FA", "#F5C2E7", "#94E2D5", "#89DCEB"],
    speed = 0.5,
    size = { min: 2, max: 5 },
    opacity = { min: 0.1, max: 0.5 },
    className = "",
  }: Props = $props();

  let canvas = $state<HTMLCanvasElement>();
  let ctx = $state<CanvasRenderingContext2D>();
  let frame = $state<number>();
  let width = $state<number>();
  let height = $state<number>();

  type Particle = {
    x: number;
    y: number;
    radius: number;
    color: string;
    vX: number;
    vY: number;
    opacity: number;
  };

  let particles: Particle[] = [];

  function createParticles() {
    if (!width || !height) return;

    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * (size.max - size.min) + size.min,
        color: colors[Math.floor(Math.random() * colors.length)],
        vX: (Math.random() - 0.5) * speed,
        vY: (Math.random() - 0.5) * speed,
        opacity: Math.random() * (opacity.max - opacity.min) + opacity.min,
      });
    }
  }

  function draw() {
    if (!ctx || !width || !height) return;

    ctx.clearRect(0, 0, width, height);

    particles.forEach((particle) => {
      particle.x += particle.vX;
      particle.y += particle.vY;
      if (particle.x < 0) particle.x = width!;
      if (particle.x > width!) particle.x = 0;
      if (particle.y < 0) particle.y = height!;
      if (particle.y > height!) particle.y = 0;
      ctx!.beginPath();
      ctx!.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx!.fillStyle = particle.color;
      ctx!.globalAlpha = particle.opacity;
      ctx!.fill();
    });

    frame = requestAnimationFrame(draw);
  }

  function handleResize() {
    if (!canvas) return;
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
    createParticles();
  }

  onMount(() => {
    if (!canvas) return;

    ctx = canvas.getContext("2d")!;
    handleResize();
    frame = requestAnimationFrame(draw);

    return () => {
      if (frame) cancelAnimationFrame(frame);
    };
  });

  onDestroy(() => {
    if (frame) cancelAnimationFrame(frame);
  });
</script>

<canvas
  bind:this={canvas}
  class="fixed inset-0 h-full w-full opacity-80 {className}"
  style="pointer-events: none;"
></canvas>

<svelte:window onresize={handleResize} />
