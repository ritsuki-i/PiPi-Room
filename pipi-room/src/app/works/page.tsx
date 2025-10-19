"use client"; // useResponsiveSizeを使うためページ全体をクライアントコンポーネントに

// src/app/works/page.tsx (新しいファイル)
import { Suspense } from 'react';
import WorkListComponent from './WorkListComponent'; // useSearchParamsを使うコンポーネントをインポート
import Loading from '@/components/Loading'; // ローディングコンポーネント
import { useResponsiveSize } from "@/hooks/useResponsiveSize"; // フックをインポート

// fallback用のコンポーネント（クライアントである必要あり）
function LoadingFallback() {
    const size = useResponsiveSize(); // クライアントフックを使用
    return (
        <div className="w-full min-h-[50vh] flex items-center justify-center">
             <Loading size={size} />
        </div>
    );
}

// ページコンポーネント（これはサーバーコンポーネントのままでも良い）
export default function WorksPage() {
  return (
    // useSearchParamsを使うコンポーネントをSuspenseでラップ
    <Suspense fallback={<LoadingFallback />}>
      <WorkListComponent />
    </Suspense>
  );
}