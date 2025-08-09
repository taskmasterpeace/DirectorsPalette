"use client"

import { useEffect, useState } from "react"
import type { ArtistProfile } from "./artist-types"

type Store = {
  activeArtist: ArtistProfile | null
}
const ACTIVE_KEY = "dsvb:active-artist"
const evt = typeof window !== "undefined" ? new EventTarget() : (null as any)
const store: Store = { activeArtist: null }

// initialize from localStorage if present
if (typeof window !== "undefined") {
  try {
    const raw = localStorage.getItem(ACTIVE_KEY)
    if (raw) store.activeArtist = JSON.parse(raw)
  } catch {}
}

export function useArtistStore() {
  const [activeArtist, setActiveArtistState] = useState<ArtistProfile | null>(store.activeArtist)

  useEffect(() => {
    if (!evt) return
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<Store>)?.detail
      if (detail) setActiveArtistState(detail.activeArtist)
      else setActiveArtistState(store.activeArtist)
    }
    evt.addEventListener("artist-store", handler as EventListener)
    return () => evt.removeEventListener("artist-store", handler as EventListener)
  }, [])

  function setActiveArtist(next: ArtistProfile | null) {
    store.activeArtist = next
    try {
      if (next) localStorage.setItem(ACTIVE_KEY, JSON.stringify(next))
      else localStorage.removeItem(ACTIVE_KEY)
    } catch {}
    if (evt) evt.dispatchEvent(new CustomEvent("artist-store", { detail: { activeArtist: next } }))
    setActiveArtistState(next)
  }

  return { activeArtist, setActiveArtist }
}
