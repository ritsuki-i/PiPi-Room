"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { AlertCircle, LogIn, LayoutDashboard, Users, Tag } from "lucide-react"
import type { ArticleType, WorkType, LabelType, TechnologieType } from "@/types"
import DashboardClient from "./DashboardClient"
import LabelManagementSection from "./LabelManagementSection"
import UserManagementSection from "./UserManagementSection"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const { user } = useUser()
  const router = useRouter()

  const [allArticles, setAllArticles] = useState<ArticleType[]>([])
  const [allWorks, setAllWorks] = useState<WorkType[]>([])
  const [userArticles, setUserArticles] = useState<ArticleType[]>([])
  const [userWorks, setUserWorks] = useState<WorkType[]>([])
  const [labels, setLabels] = useState<LabelType[]>([])
  const [technologies, setTechnologies] = useState<TechnologieType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    // Clerk でログイン済みかどうかを確認
    if (!user?.id) return

    const checkUserExists = async () => {
      try {
        const res = await fetch("/api/user/check")
        const data = await res.json()

        if (!data.exists) {
          // ✅ ユーザーが存在しない場合 `/user/createAccount` にリダイレクト
          router.push("/user/createAccount")
        } else {
          setUserRole(data.userRole)
        }
      } catch (error) {
        console.error("ユーザーの存在チェックに失敗しました:", error)
      }
    }

    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/dashboard", {
          method: "GET",
          credentials: "include", // ✅ 認証情報を送る
        })

        if (!res.ok) {
          throw new Error("データの取得に失敗しました")
        }

        const {
          allArticles,
          allWorks,
          userArticles,
          userWorks,
          labels,
          technologies,
        }: {
          allArticles: ArticleType[]
          allWorks: WorkType[]
          userArticles: ArticleType[]
          userWorks: WorkType[]
          labels: LabelType[]
          technologies: TechnologieType[]
        } = await res.json()

        setAllArticles(allArticles)
        setAllWorks(allWorks)
        setUserArticles(userArticles)
        setUserWorks(userWorks)
        setLabels(labels)
        setTechnologies(technologies)
      } catch (error) {
        console.error("エラーが発生しました:", error)
        setError(error instanceof Error ? error.message : "不明なエラー")
      } finally {
        setLoading(false)
      }
    }

    async function displayDashboard() {
      await checkUserExists()
      await fetchDashboard()
    }

    displayDashboard()
  }, [user?.id, user, router])

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
        <Card className="w-full max-w-md border-amber-200 shadow-md animate-in fade-in slide-in-from-bottom-5 duration-300">
          <CardContent className="pt-6 pb-8 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center">
              <LogIn className="h-8 w-8 text-amber-500" />
            </div>
            <h2 className="text-xl font-semibold text-center">ログインが必要です</h2>
            <p className="text-muted-foreground text-center">このコンテンツを表示するにはログインしてください</p>
            <Button className="mt-2" onClick={() => router.push("/sign-in")}>
              ログイン
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Skeleton className="h-10 w-48 mb-6" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[80%]" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-6">
                    <Skeleton className="h-5 w-3/4 mb-4" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-4/6" />
                    </div>
                  </div>
                  <div className="bg-muted/30 p-4 flex justify-end">
                    <Skeleton className="h-9 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
        <Card className="w-full max-w-md border-red-200 shadow-md animate-in fade-in slide-in-from-bottom-5 duration-300">
          <CardContent className="pt-6 pb-8 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-center">エラーが発生しました</h2>
            <p className="text-muted-foreground text-center">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()} className="mt-2">
              再読み込み
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const role = userRole
  const isAdmin = role === "admin"
  const isManager = role === "manager"
  const isMember = role === "member"

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">ダッシュボード</h1>

      <Tabs defaultValue="myworks" className="w-full">
        <TabsList className="mb-6 w-full overflow-x-auto flex flex-nowrap justify-start md:justify-center p-1 bg-muted/80">
          <TabsTrigger value="myworks" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="whitespace-nowrap">自分の制作物</span>
          </TabsTrigger>

          {(isManager || isAdmin) && (
            <>
              <TabsTrigger value="allworks" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                <span className="whitespace-nowrap">すべての制作物</span>
              </TabsTrigger>

              <TabsTrigger value="labels" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <span className="whitespace-nowrap">カテゴリ&技術</span>
              </TabsTrigger>
            </>
          )}

          {isAdmin && (
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="whitespace-nowrap">ユーザー管理</span>
            </TabsTrigger>
          )}
        </TabsList>

        {/* 自分の制作物（manager / admin / memberのみ） */}
        {(isManager || isAdmin || isMember) && (
          <TabsContent value="myworks" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
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
            <TabsContent value="allworks" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <DashboardClient
                mode="all"
                initialArticles={allArticles}
                initialWorks={allWorks}
                initialLabels={labels}
                initialTechnologies={technologies}
              />
            </TabsContent>

            <TabsContent value="labels" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <LabelManagementSection />
            </TabsContent>
          </>
        )}

        {/* ユーザー管理（adminのみ） */}
        {isAdmin && (
          <TabsContent value="users" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <UserManagementSection />
          </TabsContent>
        )}
      </Tabs>

      {!isManager && !isAdmin && !isMember && (
        <Alert variant="destructive" className="mb-6 mt-6 animate-in fade-in slide-in-from-top-5 duration-300">
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
    </div>
  )
}

