<script lang="ts">
	import { browser } from '$app/environment';
	import { onDestroy, onMount } from 'svelte';

	export let particleCount = 30;
	export let colors = ['#89B4FA', '#F5C2E7', '#94E2D5', '#89DCEB'];
	export let speed = 0.5;
	export let size = { min: 2, max: 5 };
	export let opacity = { min: 0.1, max: 0.5 };

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let frame: number;
	let width: number;
	let height: number;

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
		particles = [];
		for (let i = 0; i < particleCount; i++) {
			particles.push({
				x: Math.random() * width,
				y: Math.random() * height,
				radius: Math.random() * (size.max - size.min) + size.min,
				color: colors[Math.floor(Math.random() * colors.length)],
				vX: (Math.random() - 0.5) * speed,
				vY: (Math.random() - 0.5) * speed,
				opacity: Math.random() * (opacity.max - opacity.min) + opacity.min
			});
		}
	}

	function draw() {
		if (!ctx) return;

		ctx.clearRect(0, 0, width, height);

		particles.forEach((particle) => {
			particle.x += particle.vX;
			particle.y += particle.vY;

			// pain
			if (particle.x < 0) particle.x = width;
			if (particle.x > width) particle.x = 0;
			if (particle.y < 0) particle.y = height;
			if (particle.y > height) particle.y = 0;

			// draw
			ctx.beginPath();
			ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
			ctx.fillStyle = particle.color;
			ctx.globalAlpha = particle.opacity;
			ctx.fill();
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

		ctx = canvas.getContext('2d')!;
		handleResize();
		browser && window.addEventListener('resize', handleResize);
		frame = requestAnimationFrame(draw);

		return () => {
			cancelAnimationFrame(frame);
			browser && window.removeEventListener('resize', handleResize);
		};
	});

	onDestroy(() => {
		if (frame) cancelAnimationFrame(frame);
		browser && window.removeEventListener('resize', handleResize);
	});
</script>

<canvas
	bind:this={canvas}
	class="absolute inset-0 h-full w-full opacity-40"
	style="pointer-events: none;"
></canvas>
