export function createServiceRotation({
  intervalMs = 4500,
  fadeMs = 900,
  schedule = setTimeout,
  cancel = clearTimeout,
} = {}) {
  const participants = new Map();
  let timer = null;
  let phase = "loading";

  const clearTimer = () => {
    if (timer !== null) cancel(timer);
    timer = null;
  };

  const reconcile = () => {
    const active = [...participants.values()].filter((entry) => entry.active);
    if (!active.length || active.some((entry) => !entry.ready)) {
      clearTimer();
      phase = "loading";
      return;
    }
    if (phase !== "loading") return;

    phase = "fading";
    active.forEach((entry) => entry.fade());
    timer = schedule(() => {
      timer = null;
      active.forEach((entry) => entry.finish());
      phase = "dwelling";
      timer = schedule(() => {
        timer = null;
        phase = "loading";
        const next = [...participants.values()].filter((entry) => entry.active);
        next.forEach((entry) => {
          entry.ready = !entry.advance();
        });
        reconcile();
      }, intervalMs);
    }, fadeMs);
  };

  return {
    register(id, callbacks) {
      participants.set(id, { ...callbacks, active: false, ready: false });
      return () => {
        participants.delete(id);
        reconcile();
      };
    },
    update(id, active, ready) {
      const entry = participants.get(id);
      if (!entry) return;
      if (active && !entry.active) {
        clearTimer();
        phase = "loading";
      }
      entry.active = active;
      entry.ready = ready;
      reconcile();
    },
    dispose() {
      clearTimer();
      phase = "loading";
    },
  };
}
