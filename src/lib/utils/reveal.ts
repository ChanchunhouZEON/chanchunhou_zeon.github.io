export type RevealDirection = 'up' | 'left' | 'right' | 'scale' | 'tilt';

export function reveal(
	node: HTMLElement,
	options?: { delay?: number; direction?: RevealDirection }
) {
	const dir = options?.direction ?? 'up';
	node.classList.add('reveal', `reveal--${dir}`);

	if (options?.delay) {
		node.style.transitionDelay = `${options.delay}ms`;
	}

	const observer = new IntersectionObserver(
		([entry]) => {
			if (entry.isIntersecting) {
				node.classList.add('revealed');
				observer.unobserve(node);
			}
		},
		{ threshold: 0.1 }
	);

	observer.observe(node);
	return { destroy: () => observer.disconnect() };
}

export function spotlight(node: HTMLElement) {
	function handleMove(e: MouseEvent) {
		const rect = node.getBoundingClientRect();
		node.style.setProperty('--spot-x', `${e.clientX - rect.left}px`);
		node.style.setProperty('--spot-y', `${e.clientY - rect.top}px`);
	}

	node.classList.add('card-spotlight');
	node.addEventListener('mousemove', handleMove);
	return { destroy: () => node.removeEventListener('mousemove', handleMove) };
}

export function magnetic(node: HTMLElement, strength: number = 0.25) {
	function handleMove(e: MouseEvent) {
		const rect = node.getBoundingClientRect();
		const dx = (e.clientX - (rect.left + rect.width / 2)) * strength;
		const dy = (e.clientY - (rect.top + rect.height / 2)) * strength;
		node.style.transform = `translate(${dx}px, ${dy}px)`;
	}
	function handleLeave() {
		node.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
		node.style.transform = '';
		setTimeout(() => (node.style.transition = ''), 500);
	}

	node.addEventListener('mousemove', handleMove);
	node.addEventListener('mouseleave', handleLeave);
	return {
		destroy() {
			node.removeEventListener('mousemove', handleMove);
			node.removeEventListener('mouseleave', handleLeave);
		}
	};
}
