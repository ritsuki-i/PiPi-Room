"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GuidePopup } from "@/components/GuidePopup"

interface OpenRoomProps {
    isPortrait: boolean;
    availableHeight: string;
}

export function OpenRoom({ isPortrait, availableHeight }: OpenRoomProps) {
    const router = useRouter();
    const [showGuide, setShowGuide] = useState(false);

    const getBackgroundSize = () => {
        return isPortrait ? "auto 100%" : "100vw auto";
    };

    // 画面の向きに応じた紙（「はじめる」の紙）のスタイルを設定
    const getPaperStyle = () => {

        if (isPortrait) {
            // 縦画面の場合、横サイズを画面横の50％に指定（比率維持のため縦は自動調整）
            return {
                top: "50%",    // 垂直方向の位置
                left: "50%",   // 水平方向の中央
                height: "50vw",
                width: "auto", // 高さに合わせて幅を自動調整
            };
        } else {
            // 横画面の場合、縦サイズを画面横の33％に指定
            return {
                top: "50%",    // 垂直方向の位置
                left: "50%",   // 水平方向の中央
                height: "40%",
                width: "auto", // 高さに合わせて幅を自動調整
            };
        }
    };

    // 画面の向きに応じた本（使い方）のスタイルを設定
    const getBookStyle = () => {
        if (isPortrait) {
            // 縦画面の場合、横サイズを画面横の33％に指定（比率維持のため高さは自動調整）
            return {
                top: "40%",     // 本の垂直方向の位置
                left: "15%",    // 本の水平方向の位置
                width: "33vw",  // 画面横の33％
                height: "auto",
            };
        } else {
            // 横画面の場合、縦サイズを画面縦の25％に指定
            return {
                top: "30%",   // 本の垂直方向の位置
                left: "30%",  // 本の水平方向の位置
                height: "25%",// 画面縦の25％
                width: "auto",
            };
        }
    };

    return (
        <div className="relative w-screen" style={{ height: availableHeight }}>
            {/* 背景画像（画面いっぱい） */}
            <img
                src="/images/bg_desk.png"
                alt="机"
                className="absolute top-0 left-0 w-full h-full object-cover z-0"
                style={{ backgroundSize: getBackgroundSize() }}
            />

            {/* 「はじめる」の紙（中央に配置、ホバー・クリックで拡大） */}
            <img
                src="/images/start-paper.png"
                alt="はじめる"
                className="absolute z-10 cursor-pointer hover:scale-110 active:scale-105 transition-transform duration-300 drop-shadow-lg transform -translate-x-1/2 -translate-y-1/2"
                style={getPaperStyle()}
                onClick={() => router.push("/works")}
            />

            {/* 「使い方」の本（紙の左上に配置、ホバー・クリックで拡大） */}
            <img
                src="/images/book.png"
                alt="使い方"
                className="absolute z-10 cursor-pointer hover:scale-110 active:scale-105 transition-transform duration-300 drop-shadow-md transform -translate-x-1/2 -translate-y-1/2"
                style={getBookStyle()}
                onClick={() => setShowGuide(true)}
            />

            {/* 本（使い方）をクリックした際に表示されるポップアップ */}
            {showGuide && <GuidePopup onClose={() => setShowGuide(false)} />}
        </div>
    );
}
