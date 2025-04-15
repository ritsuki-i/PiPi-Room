"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface GuidePage {
  title: string;
  content: JSX.Element | string;
}

interface GuidePopupProps {
  onClose: () => void;
}

export function GuidePopup({ onClose }: GuidePopupProps) {
  // 各ページの内容を定義
  const pages: GuidePage[] = [
    {
      title: "アプリの概要",
      content: (
        <div>
          <p>
            このアプリは、サークルのメンバーが作った作品や勉強会の記録を保存し、いつでも見返せるツールです。
            <br />
            誰がどんな作品を作ったかがひと目でわかり、コメント機能やシンプルなUIで、先輩からフィードバックをもらえます。
            <br />
            みんなで作品を通じたコミュニケーションを楽しみながら学べる環境を目指しています！
          </p>
        </div>
      ),
    },
    {
      title: "ログインについて",
      content: (
        <div>
          <p>
            ログインすると、コメントができるようになります。
            <br />
            さらに、サークルのメンバーとして認められると、作品や記事の投稿・編集が可能になります。
          </p>
        </div>
      ),
    },
    {
      title: "アプリの機能",
      content: (
        <div>
          <p>
            <strong>Works</strong>: メンバー全員の作品を見られて、コメントもできます。
          </p>
          <p>
            <strong>Articles</strong>: みんなが書いた記事をチェックでき、コメントが可能です。
          </p>
          <p>
            <strong>Dashboard</strong>: 自分の作品や記事の作成・編集ができます。
          </p>
          <p>
            <strong>Profile</strong>: 自分のプロフィールを設定するページです。
            <br />
            必須項目には*がついており、公開されるのは表示名、アイコン、ポートフォリオサイト、GithubのURLです。
            <br />
            メールアドレスを登録すると、自分の作品にコメントがあったときに通知を受け取れます。（実装予定）
          </p>
        </div>
      ),
    },
    {
      title: "記事の投稿方法",
      content: (
        <div>
          <p>
            1. Dashboardの「新規作成」から「記事作成」を選びます。
            <br />
            2. タイトルとカテゴリを入力し、次へ進むと記事編集ページが表示されます。
            <br />
            3. 編集ページでは、マークダウン記法を使って記事を作成できます。書いた内容はプレビューで確認できます。（比較用の画像あり）
          </p>
          <p>
            画像を記事に挿入するには、挿入したい場所にカーソルを合わせ、画像挿入ボタンをクリックしてください。
            <br />
            選んだ画像に対応するマークダウンが自動的に追加されます。
          </p>
        </div>
      ),
    },
    {
      title: "コメント機能",
      content: (
        <div>
          <p>
            各作品や記事にコメントできます。（ログイン必須）
            <br />
            自分が投稿したコメントのみ、あとから編集可能です。
          </p>
        </div>
      ),
    },
    {
      title: "権限について",
      content: (
        <div>
          <p>
            <strong>admin</strong>: ユーザーの削除やロール変更など、すべての操作が可能です。
            <br />
            <strong>manager</strong>: すべての作品や記事の編集・削除ができます。
            <br />
            <strong>member</strong>: Public/Privateな作品や記事を閲覧・投稿できます。
            <br />
            <strong>general</strong>: Publicな作品や記事の閲覧とコメントができます（投稿はできません）。
          </p>
        </div>
      ),
    },
    {
      title: "PDF出力",
      content: (
        <div>
          <p>
            サークルの幹部向けに、作品や記事のデータをまとめてPDFで出力できる機能です。
            <br />
            WorksページとArticlesページからダウンロードできます。（実装予定）
          </p>
        </div>
      ),
    },
  ];

  // 現在のページインデックスを管理する state（2ページずつ表示するため、偶数ページから始める）
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
//   const [flipDirection, setFlipDirection] = useState<"next" | "prev">("next"); ページめくりの際にどちらの方向（「次」か「前」）にアニメーションが動くか
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 画面サイズの検出
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // 本を開く効果
  useEffect(() => {
    setTimeout(() => {
      setIsBookOpen(true);
    }, 300);
  }, []);

  // 次のページへ（2ページずつ進む）
  const handleNext = () => {
    if (currentPage < pages.length - 2 && !isFlipping) {
    //   setFlipDirection("next");
      setIsFlipping(true);

      // ページめくりアニメーション用のクラスを追加
      const bookContent = document.querySelector(".book-content");
      if (bookContent) {
        bookContent.classList.add("page-flip");

        setTimeout(() => {
          bookContent.classList.remove("page-flip");
          // 2ページずつ進める
          setCurrentPage((prev) =>
            Math.min(prev + 2, pages.length - (isMobile ? 1 : 2))
          );
          setIsFlipping(false);
        }, 500);
      } else {
        // DOM要素が見つからない場合はアニメーションなしで進める
        setTimeout(() => {
          setCurrentPage((prev) =>
            Math.min(prev + 2, pages.length - (isMobile ? 1 : 2))
          );
          setIsFlipping(false);
        }, 500);
      }
    }
  };

  // 前のページへ（2ページずつ戻る）
  const handlePrev = () => {
    if (currentPage > 0 && !isFlipping) {
    //   setFlipDirection("prev");
      setIsFlipping(true);

      // ページめくりアニメーション用のクラスを追加
      const bookContent = document.querySelector(".book-content");
      if (bookContent) {
        bookContent.classList.add("page-flip-reverse");

        setTimeout(() => {
          bookContent.classList.remove("page-flip-reverse");
          // 2ページずつ戻る
          setCurrentPage((prev) => Math.max(prev - 2, 0));
          setIsFlipping(false);
        }, 500);
      } else {
        // DOM要素が見つからない場合はアニメーションなしで戻る
        setTimeout(() => {
          setCurrentPage((prev) => Math.max(prev - 2, 0));
          setIsFlipping(false);
        }, 500);
      }
    }
  };

  const handleClose = () => {
    setIsBookOpen(false);
    setTimeout(() => {
      onClose();
    }, 500);
  };

  // 現在のページと次のページのインデックスを計算
  const leftPageIndex = currentPage;
  const rightPageIndex = currentPage + 1;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30 p-4 overflow-y-auto">
      <div
        className={`relative max-w-4xl w-full mx-auto transition-all duration-500 ${
          isBookOpen ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
        style={{
          maxHeight: isMobile ? "90vh" : "90vh",
          perspective: "2000px",
          overflowY: isMobile ? "auto" : "hidden",
        }}
      >
        {/* 閉じるボタン */}
        <button
          onClick={handleClose}
          className="fixed top-3 right-4 p-2 text-black hover:text-gray-300 z-[100]"
          aria-label="閉じる"
        >
          <X size={24} />
        </button>

        {/* 本の外観 */}
        <div
          className={`relative w-full transition-transform duration-500 transform-style-preserve-3d ${
            isBookOpen ? "book-open" : "book-closed"
          }`}
          style={{
            transformStyle: "preserve-3d",
            height: isMobile ? "auto" : "70vh",
          }}
        >
          {/* 本の表紙 */}
          <div
            className={`absolute inset-0 bg-gradient-to-r from-green-700 to-green-600 rounded-lg shadow-xl p-6 flex items-center justify-center transition-transform duration-500 ${
              isBookOpen ? "book-cover-open" : ""
            }`}
            style={{
              transformOrigin: "left center",
              backfaceVisibility: "hidden",
              zIndex: isBookOpen ? 0 : 10,
            }}
          >
            <div className="text-center text-white">
              <h1 className="text-2xl md:text-4xl font-bold mb-4">PiPiRoom</h1>
              <p className="text-xl md:text-2xl">使い方ガイド</p>
            </div>
          </div>

          {/* 本の中身 */}
          <div
            className={`book-content bg-white rounded-lg shadow-xl ${
              isBookOpen ? "opacity-100" : "opacity-0"
            } transition-opacity duration-300`}
            style={{
              height: isMobile ? "auto" : "100%",
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              maxHeight: isMobile ? "80vh" : "70vh",
            }}
          >
            {/* 左ページ */}
            <div
              className={`relative ${isMobile ? "w-full" : "w-1/2"} h-full bg-[#f8f5e6] p-6 ${
                isMobile ? "overflow-y-auto" : "overflow-y-auto"
              }`}
              style={{
                borderRight: isMobile ? "none" : "1px solid #e0e0e0",
                maxHeight: isMobile ? "50vh" : "auto",
              }}
            >
              {leftPageIndex < pages.length && (
                <div className="h-full flex flex-col">
                  <h2 className="text-xl font-bold mb-4 text-center text-green-800 border-b border-green-200 pb-2">
                    {pages[leftPageIndex].title}
                  </h2>
                  <div className="flex-grow prose prose-sm max-w-none">
                    {pages[leftPageIndex].content}
                  </div>
                </div>
              )}
            </div>

            {/* 右ページ（モバイルでは下部に表示） */}
            <div
              className={`${isMobile ? "w-full" : "w-1/2"} h-full bg-[#f8f5e6] p-6 flex flex-col ${
                isMobile ? "overflow-y-auto" : ""
              }`}
              style={{
                maxHeight: isMobile ? "50vh" : "auto",
              }}
            >
              {!isMobile && rightPageIndex < pages.length && (
                <div className="h-full flex flex-col">
                  <h2 className="text-xl font-bold mb-4 text-center text-green-800 border-b border-green-200 pb-2">
                    {pages[rightPageIndex].title}
                  </h2>
                  <div className="flex-grow prose prose-sm max-w-none">
                    {pages[rightPageIndex].content}
                  </div>
                </div>
              )}

              {/* ナビゲーションコントロール */}
              <div className="flex justify-between items-center mt-auto pt-4 border-t border-green-200">
                <button
                  onClick={handlePrev}
                  disabled={currentPage === 0 || isFlipping}
                  className={`flex items-center px-3 py-1 rounded ${
                    currentPage === 0 || isFlipping
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-green-700 hover:bg-green-100"
                  }`}
                  aria-label="前のページ"
                >
                  <ChevronLeft size={20} className="mr-1" />
                  <span>前のページ</span>
                </button>

                <div className="text-sm text-gray-600">
                  {currentPage + 1}-{Math.min(currentPage + 2, pages.length)} / {pages.length}
                </div>

                <button
                  onClick={handleNext}
                  disabled={
                    (currentPage >= pages.length - 2 && !isMobile) ||
                    (currentPage >= pages.length - 1 && isMobile) ||
                    isFlipping
                  }
                  className={`flex items-center px-3 py-1 rounded ${
                    (currentPage >= pages.length - 2 && !isMobile) ||
                    (currentPage >= pages.length - 1 && isMobile) ||
                    isFlipping
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-green-700 hover:bg-green-100"
                  }`}
                  aria-label="次のページ"
                >
                  <span>次のページ</span>
                  <ChevronRight size={20} className="ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .book-closed {
          transform: rotateY(0deg);
        }
        
        .book-open {
          transform: rotateY(0deg);
        }
        
        .book-cover-open {
          transform: rotateY(-180deg);
        }
        
        @media (max-width: 768px) {
          .book-cover-open {
            transform: rotateX(-180deg);
          }
        }
        
        /* ページめくりアニメーション */
        .page-flip {
          animation: pageFlip 0.5s forwards;
        }
        
        .page-flip-reverse {
          animation: pageFlipReverse 0.5s forwards;
        }
        
        @keyframes pageFlip {
          0% {
            transform: rotateY(0);
            opacity: 1;
          }
          50% {
            transform: rotateY(10deg);
            opacity: 0.5;
          }
          100% {
            transform: rotateY(0);
            opacity: 1;
          }
        }
        
        @keyframes pageFlipReverse {
          0% {
            transform: rotateY(0);
            opacity: 1;
          }
          50% {
            transform: rotateY(-10deg);
            opacity: 0.5;
          }
          100% {
            transform: rotateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
