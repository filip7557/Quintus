"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/services/authService";
import { isAdminOrOwner } from "@/lib/authz";

let cachedToken = undefined;
let cachedCanManage = undefined;
let inFlightPromise = null;
const subscribers = new Set();

function getAccessToken() {
  try {
    return localStorage.getItem("accessToken");
  } catch {
    return null;
  }
}

function publish() {
  subscribers.forEach((fn) => {
    try {
      fn();
    } catch {
      // ignore subscriber errors
    }
  });
}

async function resolveCanManageForToken(token) {
  if (!token) return false;
  const resp = await getCurrentUser();
  const user = resp?.data;
  return Boolean(user && isAdminOrOwner(user));
}

export default function useCanManageSite() {
  const [canManage, setCanManage] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();

    // Fast-path: token matches cache.
    if (cachedToken === token && typeof cachedCanManage === "boolean") {
      setCanManage(cachedCanManage);
      setLoading(false);
      return;
    }

    // No token => no permissions.
    if (!token) {
      cachedToken = token;
      cachedCanManage = false;
      inFlightPromise = null;
      setCanManage(false);
      setLoading(false);
      publish();
      return;
    }

    // Subscribe to updates (shared for all hook instances).
    const onUpdate = () => {
      const liveToken = getAccessToken();
      if (cachedToken === liveToken && typeof cachedCanManage === "boolean") {
        setCanManage(cachedCanManage);
        setLoading(false);
      }
    };
    subscribers.add(onUpdate);

    // Start (or join) an in-flight request for this token.
    setLoading(true);
    if (!inFlightPromise || cachedToken !== token) {
      cachedToken = token;
      cachedCanManage = undefined;
      inFlightPromise = resolveCanManageForToken(token)
        .then((val) => {
          // Only commit if token didn't change mid-flight.
          const liveToken = getAccessToken();
          if (cachedToken === liveToken) {
            cachedCanManage = Boolean(val);
          }
        })
        .catch(() => {
          const liveToken = getAccessToken();
          if (cachedToken === liveToken) {
            cachedCanManage = false;
          }
        })
        .finally(() => {
          inFlightPromise = null;
          publish();
        });
    }

    // Set once we have a result.
    onUpdate();

    return () => {
      subscribers.delete(onUpdate);
    };
  }, []);

  return { canManage, loading };
}
