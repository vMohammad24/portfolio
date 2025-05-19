import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export function createIntersectionObserver(threshold = 0.1, rootMargin = '0px') {
    const elements = new Map();
    let observer: IntersectionObserver;

    const { subscribe, set } = writable<Map<Element, boolean>>(elements);

    function observe(element: Element | null | undefined, options?: { once?: boolean }) {
        if (!browser || !element) return false;
        const observerOptions = options || { once: true };
        if (!observer) {
            observer = new IntersectionObserver(
                (entries) => {
                    for (const entry of entries) {
                        elements.set(entry.target, entry.isIntersecting);

                        if (observerOptions.once && entry.isIntersecting) {
                            observer.unobserve(entry.target);
                        }
                    }
                    set(elements);
                },
                { threshold, rootMargin }
            );
        }

        elements.set(element, false);
        observer.observe(element);
        return elements;
    }

    function unobserve(element: Element | null | undefined) {
        if (!browser || !observer || !element) return;

        observer.unobserve(element);
        elements.delete(element);
        set(elements);
    }

    function get(element: Element | null | undefined): boolean {
        if (!element) return false;
        return elements.get(element) || false;
    }

    function hasIntersecting(): boolean {
        for (const isIntersecting of elements.values()) {
            if (isIntersecting) return true;
        }
        return false;
    }

    return {
        subscribe,
        observe,
        unobserve,
        get,
        hasIntersecting,
        intersection: (node: Element, options?: { once?: boolean }) => {
            observe(node, options);
            return {
                destroy() {
                    unobserve(node);
                }
            };
        }
    };
}

export const viewport = createIntersectionObserver(0.1);