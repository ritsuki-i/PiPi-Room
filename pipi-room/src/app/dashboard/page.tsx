"use client"; // ✅ クライアントコンポーネントとして明示

import DashboardClient from "./DashboardClient";
import { ArticleType, WorkType, LabelType, TechnologieType } from "@/types";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function DashboardPage() {
  const { user } = useUser();
  const router = useRouter();

  const [articles, setArticles] = useState<ArticleType[]>([]);
  const [works, setWorks] = useState<WorkType[]>([]);
  const [labels, setLabels] = useState<LabelType[]>([]);
  const [technologies, setTechnologies] = useState<TechnologieType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Clerk でログイン済みかどうかを確認
    if (!user?.id) return;

    const checkUserExists = async () => {

      try {
        const res = await fetch("/api/user/check");
        const data = await res.json();

        if (!data.exists) {
          // ✅ ユーザーが存在しない場合 `/user/createAccount` にリダイレクト
          router.push("/user/createAccount");
        }
      } catch (error) {
        console.error("ユーザーの存在チェックに失敗しました:", error);
      }
    };

    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/dashboard", {
          method: "GET",
          credentials: "include", // ✅ 認証情報を送る
        });

        if (!res.ok) {
          throw new Error("データの取得に失敗しました");
        }

        const { articles, works, labels, technologies }: { articles: ArticleType[]; works: WorkType[]; labels: LabelType[]; technologies: TechnologieType[] } = await res.json();
        setArticles(articles);
        setWorks(works);
        setLabels(labels);
        setTechnologies(technologies);
      } catch (error) {
        console.error("エラーが発生しました:", error);
        setError(error instanceof Error ? error.message : "不明なエラー");
      } finally {
        setLoading(false);
      }
    };

    async function displayDashboard() {
      await checkUserExists();
      await fetchDashboard();
    }

    displayDashboard();
  }, [user?.id, user, router]);

  if (!user) return <div>ログインが必要です</div>; // ✅ ログインしていない場合の表示

  if (loading) return <div>📡 データを取得中...</div>;
  if (error) return <div>❌ {error}</div>;

  return <DashboardClient initialArticles={articles} initialWorks={works} initialLabels={labels} initialTechnologies={technologies} />;
}
