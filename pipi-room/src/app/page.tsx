"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useResponsiveSize } from "@/hooks/useResponsiveSize"
import Loading from "@/components/Loading"
import { OpenRoom } from "@/components/OpenRoom"

export default function Home() {
  const [current, setCurrent] = useState(0)
  const [showNextComponent, setShowNextComponent] = useState(false)
  const [nextComponentOpacity, setNextComponentOpacity] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSkipAnimation, setIsSkipAnimation] = useState(false)
  const [availableHeight, setAvailableHeight] = useState("calc(100vh - 60px)")
  const containerRef = useRef<HTMLDivElement>(null)

  const size = useResponsiveSize()

  // 縦画面かどうかを検出
  const isPortrait = useMediaQuery("(orientation: portrait)")

  useEffect(() => {
    // sessionStorage に記録された訪問回数をチェック
    const visitCount = parseInt(sessionStorage.getItem("visitCount") || "0", 10)
    const newCount = visitCount + 1
    sessionStorage.setItem("visitCount", newCount.toString())

    // 3回目以降ならアニメーションをスキップ
    if (newCount >= 3) {
      setIsSkipAnimation(true)
      setCurrent(3)
      setShowNextComponent(true)
      setNextComponentOpacity(1)
    }
  }, [])

  // スクロールを防止し、利用可能な高さを計算するためのeffect
  useEffect(() => {
    // スクロールを無効化
    document.body.style.overflow = "hidden"
    document.documentElement.style.overflow = "hidden"

    // ヘッダーの高さを取得して利用可能な高さを計算
    const headerHeight = 60 // ヘッダーの実際の高さ（px）
    const calculatedHeight = `calc(100vh - ${headerHeight}px)`
    setAvailableHeight(calculatedHeight)

    // 画像のプリロード
    const preloadImages = async () => {
      const imageUrls = ["/images/door1.png", "/images/door2.png", "/images/door3.png", "/images/roomBackground.png"]

      const promises = imageUrls.map((url) => {
        return new Promise((resolve, reject) => {
          const img = new Image()
          img.onload = () => resolve(url)
          img.onerror = () => reject(`Failed to load ${url}`)
          img.src = url
        })
      })

      try {
        await Promise.all(promises)
        setIsLoaded(true)
      } catch (error) {
        console.error("Image preload error:", error)
        // エラーがあっても表示はする
        setIsLoaded(true)
      }
    }

    preloadImages()

    // クリーンアップ関数
    return () => {
      document.body.style.overflow = ""
      document.documentElement.style.overflow = ""
    }
  }, [])

  // 画像の遷移とコンポーネントへのフェード効果
  useEffect(() => {
    if (!isLoaded) return // 画像がロードされるまで待つ

    let timeout: NodeJS.Timeout

    if (current === 1) {
      timeout = setTimeout(() => {
        setCurrent(2)
      }, 800)
    } else if (current === 2) {
      timeout = setTimeout(() => {
        setCurrent(3)
      }, 1200)
    } else if (current === 3) {
      // 4枚目の画像を表示した後、次のコンポーネントへのフェード開始
      timeout = setTimeout(() => {
        // 次のコンポーネントを表示するが、不透明度は0から始める
        setShowNextComponent(true)

        // フェードイン効果のためのアニメーション
        const fadeStart = performance.now()
        const fadeDuration = 1500 // 1.5秒かけてフェード

        const animateFade = (timestamp: number) => {
          const elapsed = timestamp - fadeStart
          const progress = Math.min(elapsed / fadeDuration, 1)

          // 不透明度を更新
          setNextComponentOpacity(progress)

          if (progress < 1) {
            requestAnimationFrame(animateFade)
          }
        }

        requestAnimationFrame(animateFade)
      }, 1200)
    }

    return () => clearTimeout(timeout)
  }, [current, isLoaded])

  const handleImageClick = () => {
    if (current === 0 && isLoaded) {
      setCurrent(1)
    }
  }

  // ズーム効果と明るさの設定
  const getZoomAndBrightness = (index: number) => {
    const scale = 1 + index * 0.2 // 各ステップで20%ずつズーム
    const brightness = index * 0.2 // 各ステップで明るさを増加

    return {
      transform: `scale(${scale})`,
      filter: `brightness(${1 + brightness})`,
    }
  }

  // 画面の向きに応じた背景サイズを取得
  const getBackgroundSize = () => {
    return isPortrait ? "auto 100%" : "100vw auto"
  }

  const frameClass = (index: number) =>
    cn(
      "absolute top-0 left-0 w-full h-full transition-all duration-1000 ease-in-out",
      current === index ? "opacity-100" : "opacity-0",
    )

  // ローディング中の表示
  if (!isLoaded) {
    return (
      <div
        className="fixed top-[60px] left-0 right-0 bottom-0 w-screen bg-[#fffaf0] flex items-center justify-center"
        style={{ height: availableHeight }}
      >
        <Loading size={size} />
      </div>
    )
  }

  // ⚠ アニメーションなしパターンはここで止める
  if (isSkipAnimation) {
    return (
      <OpenRoom isPortrait={isPortrait} availableHeight={availableHeight} />
    )
  }

  return (
    <>
      <div
        ref={containerRef}
        className="fixed top-[60px] left-0 right-0 bottom-0 w-screen bg-[#fffaf0] overflow-hidden"
        style={{
          height: availableHeight,
          opacity: showNextComponent ? 1 - nextComponentOpacity : 1, // フェードアウト効果
          zIndex: showNextComponent ? 10 : 20, // コンポーネントが表示されたら背面に
        }}
      >
        {/* 白い光のオーバーレイ */}
        <div
          className="absolute top-0 left-0 w-full h-full bg-white transition-opacity duration-1000 ease-in-out z-10 pointer-events-none"
          style={{ opacity: current * 0.2 }} // 各ステップで20%ずつ白くなる
        />

        {/* 画像コンテナ - 画面の中央に配置 */}
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center overflow-hidden">
          {[0, 1, 2, 3].map((index) =>
            index === 3 ? (
              <div
                key={index}
                className={frameClass(index)}
                style={{
                  backgroundImage: `url('/images/roomBackground.png')`,
                  backgroundSize: getBackgroundSize(),
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  width: "100%",
                  height: "100%",
                }}
                onClick={handleImageClick}
              />
            ) : (
              <div
                key={index}
                className={frameClass(index)}
                style={{
                  backgroundImage: `url('/images/door${index + 1}.png')`,
                  backgroundSize: getBackgroundSize(),
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  width: "100%",
                  height: "100%",
                  ...getZoomAndBrightness(index),
                }}
                onClick={handleImageClick}
              />
            ),
          )}
        </div>
      </div>

      {/* 次のコンポーネント（フェードイン効果） */}
      {showNextComponent && (
        <div
          className="fixed top-[60px] left-0 right-0 bottom-0 w-screen transition-opacity duration-1000 ease-in-out"
          style={{
            height: availableHeight,
            opacity: nextComponentOpacity,
            zIndex: 20,
          }}
        >
          <OpenRoom isPortrait={isPortrait} availableHeight={availableHeight} />
        </div>
      )}
    </>
  )
}
