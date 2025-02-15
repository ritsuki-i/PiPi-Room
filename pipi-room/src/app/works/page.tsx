"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WorkType, UserType, LabelType } from "../../types";

export default function WorkList() {
  const [works, setWorks] = useState<WorkType[]>([]);
  const [users, setUsers] = useState<{ [key: number]: UserType }>({});
  const [labels, setLabels] = useState<{ [key: number]: LabelType }>({});
  const [selectedWork, setSelectedWork] = useState<WorkType | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const worksRes = await fetch("/api/works");
        const usersRes = await fetch("/api/user");
        const labelsRes = await fetch("/api/labels");

        const worksData: WorkType[] = await worksRes.json();
        const usersData: UserType[] = await usersRes.json();
        const labelsData: LabelType[] = await labelsRes.json();

        setWorks(worksData);
        setUsers(Object.fromEntries(usersData.map(user => [user.id, user])));
        setLabels(Object.fromEntries(labelsData.map(label => [label.id, label])));
      } catch (error) {
        console.error("データの取得に失敗しました", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {works.map((work) => (
        <Card key={work.id} className="p-4">
          <CardHeader className="flex items-center space-x-4">
            {work.icon && <img src={work.icon} alt={work.name} className="w-12 h-12 rounded-full" />}
            <CardTitle>{work.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">{work.date}</p>

            {/* 作成者を複数表示 */}
            <div className="flex flex-wrap items-center space-x-2 mt-2">
              {(work.authorIds ?? []).map(authorId => (
                users[authorId] && (
                  <Button
                    key={authorId}
                    variant="link"
                    onClick={() => setSelectedUser(users[authorId])}
                    className="flex items-center space-x-2"
                  >
                    <img src={users[authorId].avatar || "/default-avatar.png"} alt="作成者" className="w-8 h-8 rounded-full" />
                    <span>{users[authorId].displayName}</span>
                  </Button>
                )
              ))}
            </div>

            <div className="mt-2">
              {(work.labelIds ?? []).map(labelId => (
                <span key={labelId} className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs mr-2">
                  {labels[labelId]?.name}
                </span>
              ))}
            </div>
            <Button onClick={() => setSelectedWork(work)} className="mt-4 w-full">
              詳細を見る
            </Button>
          </CardContent>
        </Card>
      ))}

      {/* 作品の詳細ポップアップ */}
      {selectedWork && (
        <Dialog open={true} onOpenChange={() => setSelectedWork(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedWork.name}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col space-y-4">
              {selectedWork.icon && <img src={selectedWork.icon} alt={selectedWork.name} className="w-20 h-20 mx-auto rounded-full" />}
              <p>{selectedWork.description}</p>
              <div>
                {(selectedWork.labelIds ?? []).map(labelId => (
                  <span key={labelId} className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs mr-2">
                    {labels[labelId]?.name}
                  </span>
                ))}
              </div>

              {/* 作成者を複数表示 */}
              <div className="flex flex-wrap items-center space-x-2">
                {(selectedWork.authorIds ?? []).map(authorId => (
                  users[authorId] && (
                    <Button key={authorId} variant="link" onClick={() => setSelectedUser(users[authorId])}>
                      <img src={users[authorId].avatar || "/default-avatar.png"} alt="作成者" className="w-10 h-10 rounded-full" />
                      <span>{users[authorId].displayName}</span>
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
              <DialogTitle>{selectedUser.displayName}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col space-y-4">
              <img src={selectedUser.avatar || "/default-avatar.png"} alt="作成者" className="w-16 h-16 mx-auto rounded-full" />
              <p>{selectedUser.bio}</p>
              <Button asChild>
                <a href={selectedUser.githubUrl || "#"} target="_blank" rel="noopener noreferrer">
                  GitHub プロフィール
                </a>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
