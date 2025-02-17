"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArticleType, UserType, LabelType } from "@/types";
import Image from 'next/image'

export default function ArticleList() {
  const [articles, setArticles] = useState<ArticleType[]>([]);
  const [users, setUsers] = useState<{ [key: string]: UserType }>({});
  const [selectedArticle, setSelectedArticle] = useState<ArticleType | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [labels, setLabels] = useState<{ [key: number]: LabelType }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const articlesRes = await fetch("/api/articles");
        const articlesData: ArticleType[] = await articlesRes.json();
        setArticles(articlesData);

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
      } catch (error) {
        console.error("データの取得に失敗しました", error);
      }
    };

    fetchData();
  }, []);

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
              {/* ラベル */}
              <div className="mt-2">
                {(article.labelIds ?? []).map((labelId) => (
                  <span key={labelId} className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs mr-2">
                    {labels[labelId]?.name}
                  </span>
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{selectedArticle.title}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col space-y-4">
            <div>
                {(selectedArticle.labelIds ?? []).map(labelId => (
                  <span key={labelId} className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs mr-2">
                    {labels[labelId]?.name}
                  </span>
                ))}
              </div>

              <p className="text-sm text-gray-500">{selectedArticle.date}</p>

              {/* 作成者を複数表示 */}
              <div className="flex flex-wrap items-center space-x-2">
                {selectedArticle.authorIds?.map((authorId) => (
                  users[authorId] && (
                    <Button key={authorId} variant="link" onClick={() => setSelectedUser(users[authorId])}>
                      <Image
                        src={users[authorId].icon || "/images/default-avatar.jpeg"}
                        alt="作成者"
                        className="w-10 h-10 rounded-full"
                        width={64} height={64}
                      />
                      <span>{users[authorId].name}</span>
                    </Button>
                  )
                ))}
              </div>

              <p>{selectedArticle.content}</p>
              <Button onClick={() => setSelectedArticle(null)}>閉じる</Button>
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
              <Image src={selectedUser.icon || "/images/default-avatar.jpeg"} alt="作成者" className="w-16 h-16 mx-auto rounded-full" width={64} height={64} />
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
