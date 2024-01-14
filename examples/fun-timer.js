import { define, attribute, state, html } from "funlit";

define("fun-timer", (host) => {
  const duration = attribute(host, "duration", 20, { parse: Number });
  const remaining = state(host, 0);
  const prev = state(host, null);

  function play() {
    prev.value = performance.now();
    requestAnimationFrame(tick);
  }

  function pause() {
    prev.value = null;
  }

  function reset() {
    remaining.value = duration.value;
  }

  function tick(next) {
    if (prev.value) {
      const delta = (next - prev.value) / 1000;

      remaining.value = Math.max(0, remaining.value - delta);
      prev.value = remaining.value ? next : null;

      requestAnimationFrame(tick);
    }
  }

  host.addEventListener("connect", reset);
  host.addEventListener("disconnect", pause);

  return () => html`
    ${remaining.value.toFixed(2)}
    <button @click=${prev.value ? pause : play}>
      ${prev.value ? "pause" : "play"}
    </button>
    <button @click=${reset}>reset</button>
  `;
});
