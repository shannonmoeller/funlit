import { define, attr, val, html } from 'funlit';

define('fun-timer', (host) => {
	const duration = attr(host, 'duration', 20, { parse: Number });
	const time = val(host, 0);
	const prev = val(host, 0);

	function play() {
		prev.value = performance.now();
		requestAnimationFrame(tick);
	}

	function pause() {
		prev.value = 0;
	}

	function reset() {
		time.value = duration.value;
	}

	/**
	 * @param {number} next
	 */
	function tick(next) {
		if (!prev.value) return;

		const delta = (next - prev.value) / 1000;

		time.value = Math.max(0, time.value - delta);
		prev.value = time.value && next;

		requestAnimationFrame(tick);
	}

	host.addEventListener('connect', reset);
	host.addEventListener('disconnect', pause);

	return () => html`
		${time.value.toFixed(2)}
		<button @click=${prev.value ? pause : play}>
			${prev.value ? 'pause' : 'play'}
		</button>
		<button @click=${reset}>reset</button>
	`;
});
