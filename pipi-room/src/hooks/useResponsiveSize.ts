import { useEffect, useState } from "react"

export const useResponsiveSize = () => {
  const [size, setSize] = useState(400) // default PC

  useEffect(() => {
    const checkSize = () => {
      const width = window.innerWidth
      if (width < 640) {
        // スマホ
        setSize(200)
      } else if (width < 1024) {
        // タブレット
        setSize(300)
      } else {
        // PC
        setSize(400)
      }
    }

    checkSize()
    window.addEventListener("resize", checkSize)
    return () => window.removeEventListener("resize", checkSize)
  }, [])

  return size
}
