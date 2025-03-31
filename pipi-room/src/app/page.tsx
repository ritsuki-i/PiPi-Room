"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import Image from "next/image";

export default function HomePage() {
  const { user } = useUser();
  const router = useRouter();

  // ✅ ログイン済みならダッシュボードへリダイレクト
  const handleClick = async () => {
    if (user) {
      router.push("/works");
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gray-100">
      {/* ✅ 背景画像（PC のデザイン画像を設定） */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/images/PiedPiperlogo.png" // ✅ ここにオシャレなPCの画像を入れる
          alt="背景画像"
          layout="fill"
          objectFit="cover"
          className="opacity-30"
        />
      </div>

      {/* ✅ メインコンテンツ */}
      <div className="relative z-10 text-center p-8 bg-white bg-opacity-90 rounded-lg shadow-lg max-w-2xl">
        <h1 className="text-4xl font-extrabold text-gray-800">
          PiedPiperのアプリを一括管理
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          すべてのアプリをまとめて管理し、チームの生産性を向上させましょう。
          使用するにはサインインしてください。
        </p>
        <Button className="mt-5"
          onClick={() =>  handleClick()}>
          Start now</Button>
      </div>
    </div>
  );
}
