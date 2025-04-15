"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import HTMLFlipBook from "react-pageflip"

interface GuidePage {
  title: string
  content: JSX.Element | string
}

interface GuidePopupProps {
  onClose: () => void
}

export function GuidePopup({ onClose }: GuidePopupProps) {
  const pages: GuidePage[] = [
    {
      title: "アプリの概要",
      content: (
        <p>
          このアプリは、サークルのメンバーが作った作品や勉強会の記録を保存し、いつでも見返せるツールです。
          誰がどんな作品を作ったかがひと目でわかり、コメント機能やシンプルなUIで、先輩からフィードバックをもらえます。
          みんなで作品を通じたコミュニケーションを楽しみながら学べる環境を目指しています。
        </p>
      ),
    },
    {
      title: "ログインについて",
      content: (
        <p>
          ログインすると、コメントができるようになります。
          <br />
          メンバーになると、作品や記事の投稿・編集が可能になります。
        </p>
      ),
    },
    {
      title: "アプリの機能",
      content: (
        <>
          <p>
            <strong>Works:</strong> メンバーの作品を一覧表示
          </p>
          <p>
            <strong>Articles:</strong> 勉強会や記録記事をチェック
          </p>
          <p>
            <strong>Dashboard:</strong> 投稿・編集が可能
          </p>
          <p>
            <strong>Profile:</strong> 表示名、アイコン、ポートフォリオなどを編集
          </p>
        </>
      ),
    },
    {
      title: "記事の投稿方法",
      content: (
        <>
          <p>1. Dashboard → 新規作成 → 記事作成を選択</p>
          <p>2. タイトル・カテゴリ入力 → 編集画面へ</p>
          <p>3. Markdown記法で記述、画像挿入も可能</p>
        </>
      ),
    },
    {
      title: "コメント機能",
      content: (
        <p>
          各作品や記事にコメントが可能です（要ログイン）。
          <br />
          自分のコメントはあとで編集可能です。
        </p>
      ),
    },
    {
      title: "権限について",
      content: (
        <>
          <p>
            <strong>admin:</strong> 全操作可能
          </p>
          <p>
            <strong>manager:</strong> 編集・削除可能
          </p>
          <p>
            <strong>member:</strong> 投稿・閲覧可能
          </p>
          <p>
            <strong>general:</strong> Public作品の閲覧・コメント
          </p>
        </>
      ),
    },
    {
      title: "PDF出力",
      content: (
        <p>
          サークル幹部向けにPDF出力機能あり。
          <br />
          Works / Articles ページからダウンロード（予定）。
        </p>
      ),
    },
  ]

  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-3xl h-[80vh] flex items-center justify-center">
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute top-6 right-4 z-10 bg-white/80 rounded-full p-1.5 text-gray-800 hover:bg-white transition-colors"
          aria-label="閉じる"
        >
          <X size={24} />
        </button>

        {/* FlipBook 本体 */}
        <HTMLFlipBook
          width={350}
          height={500}
          size="stretch"
          minWidth={300}
          maxWidth={800}
          minHeight={400}
          maxHeight={1000}
          showCover={true}
          style={{}}
          startPage={0}
          drawShadow={true}
          flippingTime={800}
          usePortrait={true}
          mobileScrollSupport={true}
          className="book-shadow"
          startZIndex={0}
          autoSize={true}
          maxShadowOpacity={0.5}
          clickEventForward={true}
          useMouseEvents={true}
          swipeDistance={50}
          showPageCorners={true}
          disableFlipByClick={false}
        >
          {/* 表紙 */}
          <div className="book-cover">
            <div className="book-title">PiPiRoom</div>
            <div className="book-subtitle">使い方</div>
          </div>

          {/* 各ページ */}
          {pages.map((page, i) => (
            <div key={i} className="book-page">
              <h2 className="book-page-title">{page.title}</h2>
              <div className="book-page-content">{page.content}</div>
            </div>
          ))}

          {/* 裏表紙 */}
          <div className="book-back-cover">
            <div className="book-back-text">PiPiRoom Guide</div>
          </div>
        </HTMLFlipBook>
      </div>
    </div>
  )
}
