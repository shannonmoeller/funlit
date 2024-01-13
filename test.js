import { define, attribute, html } from "funlit";

define("fun-stepper", (host) => {
  const count = attribute(host, "count", 20, {
    parse: Number,
  });

  function decrement() {
    count.value--;
  }

  function increment() {
    count.value++;
  }

  function reset() {
    // count.value = 0;
    host.setAttribute("count", "0");
  }

  host.addEventListener("connect", async (event) => {
    try {
      console.log(event.type, host);
      await host.updateComplete;
      console.log("updateComplete", host);
    } catch (error) {
      console.error("updateError", host, error);
    }
  });

  host.addEventListener("update", (event) => {
    console.log(event.type, host);
  });

  host.addEventListener("disconnect", (event) => {
    console.log(event.type, host);
  });

  return () => html`
    <button @click=${decrement}>-</button>
    ${count}
    <button @click=${increment}>+</button>
    <button @click=${reset}>x</button>
  `;
});
