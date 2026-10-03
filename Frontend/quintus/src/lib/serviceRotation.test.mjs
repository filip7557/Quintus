import assert from "node:assert/strict";
import test from "node:test";
import { createServiceRotation } from "./serviceRotation.js";

function setup() {
  let now = 0;
  let nextId = 0;
  const tasks = new Map();
  const events = [];
  const rotation = createServiceRotation({
    schedule(callback, delay) {
      const id = nextId++;
      tasks.set(id, { callback, time: now + delay });
      return id;
    },
    cancel(id) {
      tasks.delete(id);
    },
  });
  const tick = (duration) => {
    const end = now + duration;
    while (tasks.size) {
      const [id, task] = [...tasks.entries()].sort((a, b) => a[1].time - b[1].time)[0];
      if (task.time > end) break;
      tasks.delete(id);
      now = task.time;
      task.callback();
    }
    now = end;
  };
  const add = (id, advances = true) => rotation.register(id, {
    advance() {
      events.push({ id, action: "advance", time: now });
      return advances;
    },
    fade() {
      events.push({ id, action: "fade", time: now });
    },
    finish() {
      events.push({ id, action: "finish", time: now });
    },
  });
  return { rotation, tick, add, events, tasks };
}

test("slow images hold the shared fade and every card gets the full dwell", () => {
  const { rotation, tick, add, events } = setup();
  add("fast");
  add("slow");
  rotation.update("fast", true, false);
  rotation.update("slow", true, false);
  rotation.update("fast", true, true);
  tick(6500);
  assert.deepEqual(events, []);
  rotation.update("slow", true, true);
  assert.deepEqual(events.map((event) => event.time), [6500, 6500]);
  tick(900 + 4499);
  assert.equal(events.filter((event) => event.action === "advance").length, 0);
  tick(1);
  assert.deepEqual(events.filter((event) => event.action === "advance").map((event) => event.time), [11900, 11900]);
  rotation.update("fast", true, true);
  tick(6500);
  assert.equal(events.filter((event) => event.action === "fade").length, 2);
  rotation.update("slow", true, true);
  assert.deepEqual(events.filter((event) => event.action === "fade").slice(-2).map((event) => event.time), [18400, 18400]);
});

test("off-screen cards do not hold up visible cards", () => {
  const { rotation, tick, add, events } = setup();
  add("visible");
  add("offscreen");
  rotation.update("offscreen", false, false);
  rotation.update("visible", true, true);
  tick(5400);
  assert.deepEqual(events.filter((event) => event.action === "advance").map((event) => event.id), ["visible"]);
  rotation.update("visible", false, false);
  const count = events.length;
  tick(20000);
  assert.equal(events.length, count);
});

test("a returning card joins the loading barrier instead of skipping", () => {
  const { rotation, tick, add, events } = setup();
  add("visible");
  add("returning");
  rotation.update("visible", true, true);
  tick(2000);
  rotation.update("returning", true, false);
  tick(10000);
  assert.equal(events.filter((event) => event.action === "advance").length, 0);
  rotation.update("returning", true, true);
  assert.deepEqual(events.filter((event) => event.action === "fade").slice(-2).map((event) => event.time), [12000, 12000]);
});

test("removing a waiting card releases the barrier and disposal cancels timers", () => {
  const { rotation, tick, add, events, tasks } = setup();
  add("ready");
  const remove = add("waiting");
  rotation.update("ready", true, false);
  rotation.update("waiting", true, false);
  rotation.update("ready", true, true);
  remove();
  assert.equal(events[0].action, "fade");
  rotation.dispose();
  assert.equal(tasks.size, 0);
  tick(10000);
  assert.equal(events.length, 1);
});
