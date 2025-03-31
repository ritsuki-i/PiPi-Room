"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { WorkType, UserType, LabelType, TechnologieType } from "../../types";
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Image from "next/image";
import { ExternalLink, User, Loader2, TagIcon, ComponentIcon as ChipIcon } from "lucide-react"

export default function WorkList() {
  const [works, setWorks] = useState<WorkType[]>([]);
  const [users, setUsers] = useState<{ [key: string]: UserType }>({});
  const [labels, setLabels] = useState<{ [key: number]: LabelType }>({});
  const [technologies, setTechnologies] = useState<{ [key: number]: TechnologieType }>({});
  const [selectedWork, setSelectedWork] = useState<WorkType | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
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

  // ② userRole がセットされたあとにデータ取得・フィルタリング
  useEffect(() => {
    const fetchData = async () => {
      try {
        const worksRes = await fetch("/api/works");
        const worksData: WorkType[] = await worksRes.json();

        // ✅ フィルタリング
        const filteredWorks = worksData.filter((work) => {
          if (work.type === "Preview") return false;
          if (work.type === "Public") return true;
          if (work.type === "Private") return !(userRole === null || userRole === "general");
          return false;
        });

        setWorks(filteredWorks);

        // 各 ID 情報もここで取得
        const authorIds = Array.from(new Set(filteredWorks.flatMap(work => work.authorIds)));
        if (authorIds.length > 0) {
          const usersRes = await fetch(`/api/user?ids=${authorIds.join(",")}`);
          const usersData: UserType[] = await usersRes.json();
          setUsers(Object.fromEntries(usersData.map(user => [user.id, user])));
        }

        const labelIds = Array.from(new Set(filteredWorks.flatMap(work => work.labelIds)));
        if (labelIds.length > 0) {
          const labelsRes = await fetch(`/api/labels?ids=${labelIds.join(",")}`);
          const labelsData: LabelType[] = await labelsRes.json();
          setLabels(Object.fromEntries(labelsData.map(label => [label.id, label])));
        }

        const technologieIds = Array.from(new Set(filteredWorks.flatMap(work => work.technologieIds)));
        if (technologieIds.length > 0) {
          const technologiesRes = await fetch(`/api/technologies?ids=${technologieIds.join(",")}`);
          const technologiesData: TechnologieType[] = await technologiesRes.json();
          setTechnologies(Object.fromEntries(technologiesData.map(t => [t.id, t])));
        }
      } catch (error) {
        console.error("データの取得に失敗しました", error);
      } finally {
        setLoading(false);
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {works.map((work) => {
        const authorIds = work.authorIds ?? [];
        if (authorIds.length === 0) {
          // 作成者がいない場合
          return (
            <Card key={work.id} className="p-0">
              <CardHeader className="flex items-center p-0">
                <Image src={work.icon || "/images/noimg.png"} alt={work.name} className="w-[100%] h-[200px] object-cover" width={100} height={100} />
                <CardTitle className="text-2xl font-bold">{work.name}</CardTitle>
              </CardHeader>
              <CardContent>

                {/* ラベル */}
                <div className="mt-2">
                  {(work.labelIds ?? []).map((labelId) => (
                    <span key={labelId} className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs mr-2">
                      {labels[labelId]?.name}
                    </span>
                  ))}
                  {(work.technologieIds ?? []).map((technologieId) => (
                    <span key={technologieId} className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs mr-2">
                      {technologies[technologieId]?.name}
                    </span>
                  ))}
                </div>

                <p className="text-sm text-gray-500">{work.date}</p>
                {/* 作成者なし */}
                <div className="text-sm text-gray-500">作成者不明</div>

                <div className="flex justify-center mt-4">
                  <Button onClick={() => setSelectedWork(work)}>詳細を見る</Button>
                </div>
              </CardContent>
            </Card>
          );
        }

        // 作成者が1人以上いる場合
        const firstAuthorId = authorIds[0];
        const firstAuthor = users[firstAuthorId] || { icon: "", name: "不明" };
        const othersCount = authorIds.length - 1;

        return (
          <Card key={work.id} className="p-0">
            <CardHeader className="flex items-center p-0">
              <Image src={work.icon || "/images/noimg.png"} alt={work.name} className="w-[100%] h-[200px] object-cover" width={100} height={100} />
              <CardTitle className="text-2xl font-bold">{work.name}</CardTitle>
            </CardHeader>
            <CardContent>
              {/* ラベル */}
              <div className="mt-2">
                {(work.labelIds ?? []).map((labelId) => (
                  <Badge key={labelId} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100 px-2 py-1 rounded mr-2">
                    <TagIcon className="h-3 w-3" />
                    {labels[labelId]?.name}
                  </Badge>
                ))}
                {(work.technologieIds ?? []).map((technologieId) => (
                  <Badge
                    key={technologieId}
                    variant="outline"
                    className="text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 px-2 py-1 rounded mr-2"
                  >
                    <ChipIcon className="h-3 w-3" />
                    {technologies[technologieId]?.name}
                  </Badge>
                ))}
              </div>

              <p className="text-sm text-gray-500">{work.date}</p>

              {/* 作成者を1人だけ + 残りn人 */}
              <div className="flex items-center space-x-2">
                <Image
                  src={firstAuthor.icon || "/images/default-avatar.jpeg"}
                  alt="作成者"
                  className="w-8 h-8 rounded-full"
                  width={100} height={100}
                />
                <span>{firstAuthor.name}</span>
                {othersCount > 0 && (
                  <span className="ml-1 text-sm text-gray-500">+{othersCount}</span>
                )}
              </div>

              <div className="flex justify-center mt-4">
                <Button onClick={() => setSelectedWork(work)}>詳細を見る</Button>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* 作品の詳細ポップアップ */}
      {selectedWork && (
        <Dialog open={!!selectedWork} onOpenChange={() => setSelectedWork(null)}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">{selectedWork.name}</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col space-y-6 mt-2">
              {/* 画像 */}
              <div className="relative rounded-lg overflow-hidden border border-muted">
                <Image
                  src={selectedWork.icon || "/images/noimg.png"}
                  alt={selectedWork.name}
                  className="w-full h-[220px] object-cover"
                  width={550}
                  height={220}
                />
              </div>

              {/* 説明文 */}
              <p className="text-muted-foreground">{selectedWork.description}</p>

              {/* タグセクション */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">タグ</h3>
                <div className="flex flex-wrap gap-2">
                  {(selectedWork.labelIds ?? []).map((labelId) => (
                    <Badge key={labelId} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                      <TagIcon className="h-3 w-3" />
                      {labels[labelId]?.name}
                    </Badge>
                  ))}
                  {(selectedWork.technologieIds ?? []).map((technologieId) => (
                    <Badge
                      key={technologieId}
                      variant="outline"
                      className="text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                    >
                      <ChipIcon className="h-3 w-3" />
                      {technologies[technologieId]?.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* 作成者セクション */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">作成者</h3>
                <div className="flex flex-wrap gap-3">
                  <TooltipProvider>
                    {(selectedWork.authorIds ?? []).map(
                      (authorId) =>
                        users[authorId] && (
                          <Tooltip key={authorId}>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2 hover:bg-muted transition-colors cursor-pointer group"
                                onClick={() => setSelectedUser(users[authorId])}
                              >
                                <div className="relative w-6 h-6 rounded-full overflow-hidden border border-muted">
                                  <Image
                                    src={users[authorId].icon || "/images/default-avatar.jpeg"}
                                    alt={users[authorId].name}
                                    className="object-cover"
                                    fill
                                  />
                                </div>
                                <span className="text-sm group-hover:underline">{users[authorId].name}</span>
                                <User className="w-3.5 h-3.5 text-muted-foreground" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>クリックして作成者情報を表示</p>
                            </TooltipContent>
                          </Tooltip>
                        ),
                    )}
                  </TooltipProvider>
                </div>
              </div>

              {/* 作品ページとGitHubへのリンク */}
              <div className="mt-4">
                {/* 両方のリンクがある場合は横並びに、片方だけの場合は全幅 */}
                <div className={`grid gap-3 ${selectedWork.url && selectedWork.githubUrl ? "grid-cols-2" : "grid-cols-1"}`}>
                  {selectedWork.githubUrl && (
                    <Button className="gap-2 group w-full" size="lg">
                      <a
                        href={selectedWork.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-full gap-2"
                      >
                        GitHubページへ
                        <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </a>
                    </Button>
                  )}

                  {selectedWork.url && (
                    <Button variant="outline" className="gap-2 group w-full" size="lg">
                      <a
                        href={selectedWork.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-full gap-2"
                      >
                        作品ページへ
                        <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
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
