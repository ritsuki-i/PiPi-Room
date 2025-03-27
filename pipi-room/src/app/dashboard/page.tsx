"use client"; // ✅ クライアントコンポーネントとして明示

import DashboardClient from "./DashboardClient";
import LabelManagementSection from "./LabelManagementSection";
import UserManagementSection from "./UserManagementSection";
import { Loader2, AlertCircle, LogIn } from "lucide-react"
import { ArticleType, WorkType, LabelType, TechnologieType } from "@/types";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardPage() {
  const { user } = useUser();
  const router = useRouter();

  const [allArticles, setAllArticles] = useState<ArticleType[]>([]);
  const [allWorks, setAllWorks] = useState<WorkType[]>([]);
  const [userArticles, setUserArticles] = useState<ArticleType[]>([]);
  const [userWorks, setUserWorks] = useState<WorkType[]>([]);
  const [labels, setLabels] = useState<LabelType[]>([]);
  const [technologies, setTechnologies] = useState<TechnologieType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [userRole, setUserRole] = useState<string | null>(null);

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
        } else {
          setUserRole(data.userRole);
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

        const { 
          allArticles, 
          allWorks, 
          userArticles, 
          userWorks, 
          labels, 
          technologies 
        }: { 
          allArticles: ArticleType[]; 
          allWorks: WorkType[]; 
          userArticles: ArticleType[]; 
          userWorks: WorkType[]; 
          labels: LabelType[]; 
          technologies: TechnologieType[] 
        } = await res.json();

        setAllArticles(allArticles);
        setAllWorks(allWorks);
        setUserArticles(userArticles);
        setUserWorks(userWorks);
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

  if (!user) {
    return (
      <Card className="w-full max-w-md mx-auto mt-[50px] border-amber-200">
        <CardContent className="pt-6 flex flex-col items-center gap-4">
          <LogIn className="h-12 w-12 text-amber-500" />
          <h2 className="text-xl font-semibold text-center">ログインが必要です</h2>
          <p className="text-muted-foreground text-center">このコンテンツを表示するにはログインしてください</p>
        </CardContent>
      </Card>
    )
  }

  // Loading state
  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto mt-[50px] border-blue-200">
        <CardContent className="pt-6 flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
          <h2 className="text-xl font-semibold text-center">データを取得中...</h2>
          <p className="text-muted-foreground text-center">しばらくお待ちください</p>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto mt-[50px] border-red-200">
        <CardContent className="pt-6 flex flex-col items-center gap-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h2 className="text-xl font-semibold text-center">エラーが発生しました</h2>
          <p className="text-muted-foreground text-center">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()} className="mt-2">
            再読み込み
          </Button>
        </CardContent>
      </Card>
    )
  }
  const role = userRole;
  const isAdmin = role === "admin";
  const isManager = role === "manager";
  const isMember = role === "member";

  return (
    <div className="p-4">
      <Tabs defaultValue="myworks" className="w-full">
        {(isManager || isAdmin) && (
          <TabsList>
            <TabsTrigger value="myworks">自分の制作物</TabsTrigger>
            {(isManager || isAdmin) &&
              <>
                <TabsTrigger value="allworks">すべての制作物</TabsTrigger>
                <TabsTrigger value="labels">カテゴリ&使用技術の管理</TabsTrigger>
              </>
            }
            {isAdmin && <TabsTrigger value="users">ユーザー管理</TabsTrigger>}
          </TabsList>
        )}

        {/* 自分の制作物（manager / admin / memberのみ） */}
        {(isManager || isAdmin || isMember) && (
          <TabsContent value="myworks">
            <DashboardClient
              mode="self"
              initialArticles={userArticles}
              initialWorks={userWorks}
              initialLabels={labels}
              initialTechnologies={technologies}
            />
          </TabsContent>
        )}

        {/* すべての制作物（manager / adminのみ） */}
        {(isManager || isAdmin) && (
          <>
            <TabsContent value="allworks">
              <DashboardClient
                mode="all"
                initialArticles={allArticles}
                initialWorks={allWorks}
                initialLabels={labels}
                initialTechnologies={technologies}
              />
            </TabsContent>

            <TabsContent value="labels">
              <LabelManagementSection />
            </TabsContent>
          </>
        )}

        {/* ユーザー管理（adminのみ） */}
        {isAdmin && (
          <TabsContent value="users">
            <UserManagementSection />
          </TabsContent>
        )}

        {(!isManager && !isAdmin && !isMember) && (
          <Alert variant="destructive" className="mb-6 animate-in fade-in slide-in-from-top-5 duration-300">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-lg font-semibold">アクセス権限がありません</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="text-sm leading-relaxed">
                作品の投稿権限がありません。この作品の投稿機能は青山学院大学公認サークルであるPiedPiperに属するメンバーのみ使うことができます。
                もし、所属しているのに権限がない場合、管理者(サークル長)にお問い合わせください。
              </p>
            </AlertDescription>
          </Alert>
        )}
      </Tabs>
    </div>
  )
}
