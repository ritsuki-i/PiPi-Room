"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"

interface PiedPiperLoadingProps {
  size?: number
  className?: string
  text?: string
  textColor?: string
}

export default function PiedPiperLoading({
  size = 300,
  className = "",
  text = "Loading...",
  textColor = "#5cb85c",
}: PiedPiperLoadingProps) {
  const [rotationAngle, setRotationAngle] = useState(0)

  // テキストを円形に配置するための計算
  const radius = size * 0.4 // ロゴの周りの円の半径を小さくして近づける
  const center = size / 2 // 中心点
  const letters = text.split("")

  // 文字間の角度を計算
  const anglePerLetter = 360 / (letters.length * 3)

  // 回転アニメーション
  useEffect(() => {
    const interval = setInterval(() => {
      setRotationAngle((prev) => (prev + 1) % 360)
    }, 50)

    return () => clearInterval(interval)
  }, [])

  // ロゴのサイズ計算
  const logoSize = size * 0.4

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* 回転するテキスト - 1つ目 */}
      <div
        className="absolute inset-0"
        style={{
          transform: `rotate(${rotationAngle}deg)`,
          transition: "transform 0.05s linear",
        }}
      >
        {letters.map((letter, index) => {
          // 各文字の角度を計算
          const angle = index * anglePerLetter
          // 角度をラジアンに変換
          const radian = (angle * Math.PI) / 180
          // 文字の位置を計算
          const x = center + radius * Math.cos(radian)
          const y = center + radius * Math.sin(radian)

          return (
            <div
              key={`text1-${index}`}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 font-bold"
              style={{
                left: x,
                top: y,
                transform: `translate(-50%, -50%) rotate(${angle + 90}deg)`,
                color: textColor,
                fontSize: size * 0.06,
              }}
            >
              {letter}
            </div>
          )
        })}
      </div>

      {/* 回転するテキスト - 2つ目（180度反対側） */}
      <div
        className="absolute inset-0"
        style={{
          transform: `rotate(${rotationAngle + 180}deg)`, // 180度ずらす
          transition: "transform 0.05s linear",
        }}
      >
        {letters.map((letter, index) => {
          // 各文字の角度を計算
          const angle = index * anglePerLetter
          // 角度をラジアンに変換
          const radian = (angle * Math.PI) / 180
          // 文字の位置を計算
          const x = center + radius * Math.cos(radian)
          const y = center + radius * Math.sin(radian)

          return (
            <div
              key={`text2-${index}`}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 font-bold"
              style={{
                left: x,
                top: y,
                transform: `translate(-50%, -50%) rotate(${angle + 90}deg)`,
                color: textColor,
                fontSize: size * 0.06,
              }}
            >
              {letter}
            </div>
          )
        })}
      </div>

      {/* 揺れるロゴ（画像を使用） */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          rotate: [0, -2, 0, 2, 0],
          scale: [1, 1.02, 1, 0.98, 1],
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: Number.POSITIVE_INFINITY,
        }}
      >
        <div style={{ width: logoSize, height: logoSize, position: "relative" }}>
          <Image src="/images/PiedPiperlogo.png" alt="PiedPiper Logo" fill style={{ objectFit: "contain" }} />
        </div>
      </motion.div>
    </div>
  )
}

