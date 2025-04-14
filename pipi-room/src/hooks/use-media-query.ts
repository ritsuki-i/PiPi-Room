"use client"

import { useState, useEffect } from "react"

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)

    // 初期値を設定
    setMatches(media.matches)

    // リスナーを設定
    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches)
    }

    // リスナーを追加
    media.addEventListener("change", listener)

    // クリーンアップ
    return () => {
      media.removeEventListener("change", listener)
    }
  }, [query])

  return matches
}
