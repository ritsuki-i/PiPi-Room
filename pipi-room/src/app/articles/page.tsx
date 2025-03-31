"use client";

import { useState, useEffect } from "react";
import { ExternalLink, CalendarIcon, TagIcon, ComponentIcon as ChipIcon, XIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tooltip, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArticleType, UserType, LabelType, TechnologieType } from "@/types";
import ReactMarkdown from "react-markdown"
import Image from 'next/image'

export default function ArticleList() {
  const [articles, setArticles] = useState<ArticleType[]>([]);
  const [users, setUsers] = useState<{ [key: string]: UserType }>({});
  const [selectedArticle, setSelectedArticle] = useState<ArticleType | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [labels, setLabels] = useState<{ [key: number]: LabelType }>({});
  const [technologies, setTechnologies] = useState<{ [key: number]: TechnologieType }>({});
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null);

  const RoleBadge = ({ role }: { role: string | null }) => {
    // Define styling for each role type
    const badgeStyles = {
      admin: "bg-red-100 text-red-800 hover:bg-red-100 border-red-200",
      manager: "bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200",
      member: "bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200",
      general: "bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200",
    }

    // Get the appropriate style or default to general if role doesn't match
    const style = badgeStyles[role as keyof typeof badgeStyles] || badgeStyles.general

    return (
      <Badge variant="outline" className={`font-medium ${style}`}>
        {role}
      </Badge>
    )
  }

  useEffect(() => {
    const checkUserExists = async () => {
      try {
        const res = await fetch("/api/user/check");
        const data = await res.json();

        if (data.exists) {
          setUserRole(data.userRole);
        }
      } catch (error) {
        console.error("ユーザーの存在チェックに失敗しました:", error);
      }
    };

    checkUserExists();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const articlesRes = await fetch("/api/articles");
        const articlesData: ArticleType[] = await articlesRes.json();

        const filteredWorks = articlesData.filter((article) => {
          if (article.type === "Preview") return false;
          if (article.type === "Public") return true;
          if (article.type === "Private") {
            return (
              !(userRole === null || userRole === "general")
            );
          }

          return false;
        });

        setArticles(filteredWorks);

        // ✅ `authorIds` を取得し、重複を削除
        const authorIds = Array.from(new Set(articlesData.flatMap(article => article.authorIds)));

        if (authorIds.length > 0) {
          const usersRes = await fetch(`/api/user?ids=${authorIds.join(",")}`);
          const usersData: UserType[] = await usersRes.json();
          setUsers(Object.fromEntries(usersData.map(user => [user.id, user])));
        }

        // ✅ `labelIds` を取得し、重複を削除
        const labelIds = Array.from(new Set(articlesData.flatMap(article => article.labelIds)));

        if (labelIds.length > 0) {
          const labelsRes = await fetch(`/api/labels?ids=${labelIds.join(",")}`);
          const labelsData: LabelType[] = await labelsRes.json();
          setLabels(Object.fromEntries(labelsData.map(label => [label.id, label])));
        }

        // ✅ `technologieIds` を取得し、重複を削除
        const technologieIds = Array.from(new Set(articlesData.flatMap(article => article.technologieIds)));

        if (technologieIds.length > 0) {
          const technologiesRes = await fetch(`/api/technologies?ids=${technologieIds.join(",")}`);
          const technologiesData: TechnologieType[] = await technologiesRes.json();
          setTechnologies(Object.fromEntries(technologiesData.map(technologie => [technologie.id, technologie])));
        }

        setLoading(false)
      } catch (error) {
        console.error("データの取得に失敗しました", error);
      }
    };

    fetchData();
  }, [userRole]);

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

  return (
    <div className="flex flex-col gap-4 p-4">
      {articles.map((article) => {
        const authorIds = article.authorIds ?? [];
        const firstAuthorId = authorIds[0]; // ✅ 最初の作成者ID
        const firstAuthor = firstAuthorId ? users[firstAuthorId] : null; // ✅ 作成者情報を取得

        return (
          <Card key={article.id} className="p-4">
            <CardHeader>
              <CardTitle
                className="text-lg font-bold text-blue-600 hover:underline cursor-pointer inline-flex items-center"
                onClick={() => setSelectedArticle(article)}
              >
                {article.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* カテゴリ */}
              <div className="flex flex-wrap gap-1 mt-4">
                {(article.labelIds ?? []).map((labelId) => (
                  <Badge key={labelId} variant="outline" className="flex items-center gap-1 text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100 px-2 py-1 rounded mr-2">
                    <TagIcon className="h-3 w-3" />
                    {labels[labelId]?.name}
                  </Badge>
                ))}
                {(article.technologieIds ?? []).map((technologieId) => (
                  <Badge key={technologieId} variant="secondary" className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 px-2 py-1 rounded mr-2">
                    <ChipIcon className="h-3 w-3" />
                    {technologies[technologieId]?.name}
                  </Badge>
                ))}
              </div>

              <p className="text-sm text-gray-500">{article.date}</p>
              {/* 作成者情報を表示 */}
              {firstAuthor ? (
                <div className="flex items-center mt-2">
                  <Image
                    src={firstAuthor.icon || "/images/default-avatar.jpeg"}
                    alt="作成者"
                    className="w-8 h-8 rounded-full"
                    width={64} height={64}
                  />
                  <span>{firstAuthor.name}</span>
                </div>
              ) : (
                <div className="text-sm text-gray-500">作成者不明</div>
              )}
              <p className="text-sm text-gray-700 mt-2">{article.content.slice(0, 100)}...</p>
            </CardContent>
          </Card>
        );
      })}

      {/* 記事の詳細ポップアップ */}
      {selectedArticle && (
        <Dialog open={true} onOpenChange={() => setSelectedArticle(null)}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold tracking-tight">{selectedArticle.title}</DialogTitle>
            </DialogHeader>

            <div className="flex items-center gap-2 mt-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{selectedArticle.date}</span>
            </div>

            <div className="flex flex-wrap gap-1 mt-4">
              {(selectedArticle.labelIds ?? []).map(
                (labelId) =>
                  labels[labelId] && (
                    <Badge key={labelId} variant="outline" className="flex items-center gap-1 text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100 px-2 py-1 rounded mr-2">
                      <TagIcon className="h-3 w-3" />
                      {labels[labelId].name}
                    </Badge>
                  ),
              )}

              {(selectedArticle.technologieIds ?? []).map(
                (techId) =>
                  technologies[techId] && (
                    <Badge key={techId} variant="secondary" className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 px-2 py-1 rounded mr-2">
                      <ChipIcon className="h-3 w-3" />
                      {technologies[techId].name}
                    </Badge>
                  ),
              )}
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">作成者</h3>
              <div className="flex flex-wrap gap-2">
                {selectedArticle.authorIds?.map(
                  (authorId) =>
                    users[authorId] && (
                      <TooltipProvider key={authorId}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-auto p-1 rounded-full hover:bg-muted"
                              onClick={() => setSelectedUser(users[authorId])}
                            >
                              <Avatar className="h-10 w-10">
                                <AvatarImage
                                  src={users[authorId].icon || "/placeholder.svg?height=64&width=64"}
                                  alt={users[authorId].name}
                                />
                                <AvatarFallback>{users[authorId].name}</AvatarFallback>
                              </Avatar>
                            </Button>
                          </TooltipTrigger>
                        </Tooltip>
                      </TooltipProvider>
                    ),
                )}
              </div>
            </div>

            <div className="mt-6 border-t pt-4">
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    img: ({ node, ...props }) => (
                      <div className="flex justify-center my-4">
                        <img {...props} className="max-w-full h-auto" />
                      </div>
                    ),
                  }}
                >
                  {selectedArticle.content}
                </ReactMarkdown>
              </div>
            </div>

            <div className="sticky bottom-0 z-10 p-4 flex justify-end">
              <Button onClick={() => setSelectedArticle(null)} className="flex items-center gap-2">
                <XIcon className="h-4 w-4" />
                閉じる
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* 作成者の詳細ポップアップ */}
      {selectedUser && (
        <Dialog open={true} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent>
            <DialogHeader className="space-y-2">
              <div className="flex items-center space-x-2">
                <DialogTitle className="text-xl font-semibold">{selectedUser.name}</DialogTitle>
                <RoleBadge role={selectedUser.type} />
              </div>
              <DialogDescription className="text-sm text-muted-foreground">
                ユーザー情報の詳細を表示しています
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col space-y-4">
              <Image src={selectedUser.icon || "/images/default-avatar.jpeg"} alt="作成者" className="w-16 h-16 mx-auto rounded-full" width={100} height={100} />
              <p>{selectedUser.bio}</p>
              <div className={`grid gap-3 ${selectedUser.githubUrl && selectedUser.portfolioUrl ? "grid-cols-2" : "grid-cols-1"}`}>
                {selectedUser.githubUrl && (
                  <Button className="gap-2 group w-full" size="lg">
                    <a
                      href={selectedUser.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-full gap-2"
                    >
                      GitHub プロフィール
                      <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  </Button>
                )}
                {selectedUser.portfolioUrl && (
                  <Button variant="outline" className="gap-2 group w-full" size="lg">
                    <a
                      href={selectedUser.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-full gap-2"
                    >
                      ポートフォリオサイト
                      <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
