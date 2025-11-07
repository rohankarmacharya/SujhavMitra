import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "wishlist_v2";

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStore(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export default function useWishlist() {
  const [items, setItems] = useState(() => readStore());

  useEffect(() => {
    const handler = () => setItems(readStore());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const isSaved = useCallback((kind, key) => {
    const k = String(key);
    return items.some((it) => it.kind === kind && String(it.key) === k);
  }, [items]);

  const add = useCallback((kind, key, data) => {
    const k = String(key);
    const next = items.some((it) => it.kind === kind && String(it.key) === k)
      ? items
      : [...items, { kind, key: k, data }];
    writeStore(next);
    setItems(next);
    try {
      window.dispatchEvent(
        new CustomEvent("wishlist:toast", { detail: { action: "added", kind, key: k, data, variant: "success" } })
      );
    } catch {}
  }, [items]);

  const remove = useCallback((kind, key) => {
    const k = String(key);
    const next = items.filter((it) => !(it.kind === kind && String(it.key) === k));
    writeStore(next);
    setItems(next);
    try {
      window.dispatchEvent(
        new CustomEvent("wishlist:toast", { detail: { action: "removed", kind, key: k, variant: "error" } })
      );
    } catch {}
  }, [items]);

  const toggle = useCallback((kind, key, data) => {
    if (isSaved(kind, key)) remove(kind, key);
    else add(kind, key, data);
  }, [isSaved, add, remove]);

  const list = useMemo(() => items, [items]);
  const count = items.length;

  return { isSaved, add, remove, toggle, list, count };
}
