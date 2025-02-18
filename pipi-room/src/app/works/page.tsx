"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WorkType, UserType, LabelType, TechnologieType } from "../../types";
import Image from "next/image";

export default function WorkList() {
  const [works, setWorks] = useState<WorkType[]>([]);
  const [users, setUsers] = useState<{ [key: string]: UserType }>({});
  const [labels, setLabels] = useState<{ [key: number]: LabelType }>({});
  const [technologies, setTechnologies] = useState<{ [key: number]: TechnologieType }>({});
  const [selectedWork, setSelectedWork] = useState<WorkType | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const worksRes = await fetch("/api/works");

        const worksData: WorkType[] = await worksRes.json();

        setWorks(worksData);

        // ✅ `worksData` から `authorIds` を取得し、重複を削除
        const authorIds = Array.from(new Set(worksData.flatMap(work => work.authorIds)));

        if (authorIds.length > 0) {
          const usersRes = await fetch(`/api/user?ids=${authorIds.join(",")}`);
          const usersData: UserType[] = await usersRes.json();
          setUsers(Object.fromEntries(usersData.map(user => [user.id, user])));
        }

        // ✅ `worksData` から `authorIds` を取得し、重複を削除
        const labelIds = Array.from(new Set(worksData.flatMap(work => work.labelIds)));

        if (labelIds.length > 0) {
          const labelsRes = await fetch(`/api/labels?ids=${labelIds.join(",")}`);
          const labelsData: UserType[] = await labelsRes.json();
          setLabels(Object.fromEntries(labelsData.map(label => [label.id, label])));
        }

        // ✅ `worksData` から `authorIds` を取得し、重複を削除
        const technologieIds = Array.from(new Set(worksData.flatMap(work => work.technologieIds)));

        if (technologieIds.length > 0) {
          const technologiesRes = await fetch(`/api/technologies?ids=${technologieIds.join(",")}`);
          const technologiesData: UserType[] = await technologiesRes.json();
          setTechnologies(Object.fromEntries(technologiesData.map(technologie => [technologie.id, technologie])));
        }
      } catch (error) {
        console.error("データの取得に失敗しました", error);
      }
    };

    fetchData();
  }, []);

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
              <Image src={work.icon || "/images/noimg.png"} alt={work.name} className="w-[100%] h-[200px] object-cover" width={100} height={100}/>
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
        <Dialog open={true} onOpenChange={() => setSelectedWork(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">{selectedWork.name}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col space-y-4">
              <Image src={selectedWork.icon || "/images/noimg.png"} alt={selectedWork.name} className="w-[100%] h-[200px] object-cover" width={100} height={100}/>
              <p>{selectedWork.description}</p>
              <div>
                {(selectedWork.labelIds ?? []).map(labelId => (
                  <span key={labelId} className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs mr-2">
                    {labels[labelId]?.name}
                  </span>
                ))}
                {(selectedWork.technologieIds ?? []).map(technologieId => (
                  <span key={technologieId} className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs mr-2">
                    {technologies[technologieId]?.name}
                  </span>
                ))}
              </div>

              {/* 作成者を複数表示 */}
              <div className="flex flex-wrap items-center space-x-2">
                {(selectedWork.authorIds ?? []).map(authorId => (
                  users[authorId] && (
                    <Button key={authorId} variant="link" onClick={() => setSelectedUser(users[authorId])}>
                      <Image src={users[authorId].icon || "/images/default-avatar.jpeg"} alt="作成者" className="w-10 h-10 rounded-full" width={100} height={100}/>
                      <span>{users[authorId].name}</span>
                    </Button>
                  )
                ))}
              </div>

              <Button asChild>
                <a href={selectedWork.url || "#"} target="_blank" rel="noopener noreferrer">
                  作品ページへ
                </a>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* 作成者の詳細ポップアップ */}
      {selectedUser && (
        <Dialog open={true} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedUser.name}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col space-y-4">
              <Image src={selectedUser.icon || "/images/default-avatar.jpeg"} alt="作成者" className="w-16 h-16 mx-auto rounded-full" width={100} height={100}/>
              <p>{selectedUser.bio}</p>
              {selectedUser.githubUrl ? (
                // GitHub URL がある場合
                <Button asChild>
                  <a
                    href={selectedUser.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub プロフィール
                  </a>
                </Button>
              ) : (
                // GitHub URL が無い場合
                <Button disabled>GitHub プロフィール</Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
