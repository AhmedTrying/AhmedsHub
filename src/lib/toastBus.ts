"use client";

/**
 * A tiny module-scoped event bus so non-React code (e.g. the Zustand store)
 * can push toast messages without holding a React context reference.
 *
 * The ToastProvider registers `setPusher` on mount.
 */

type Pusher = (text: string) => void;

let pusher: Pusher = () => {};

export function setToastPusher(fn: Pusher) {
  pusher = fn;
}

export function toast(text: string) {
  pusher(text);
}
