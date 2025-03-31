"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Trash, Upload, Save, Plus, ChevronLast } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { ArticleType, WorkType, LabelType, TechnologieType } from "@/types"
import Image from "next/image"
import { useRouter } from 'next/navigation';
import { supabase } from "@/lib/supabase";
import type { SearchOptions } from "@supabase/storage-js"

interface CreateOrEditModalProps {
  type: "article" | "work"
  data: ArticleType | WorkType | null
  labels: LabelType[]
  technologies: TechnologieType[]
  onClose: () => void
  onSave: (type: "article" | "work", data: ArticleType | WorkType, mode: "create" | "edit" | "delete") => void
  onCreateLabel: (label: LabelType) => void
  onCreateTechnologie: (technologie: TechnologieType) => void
}

const templateContent = `
## 📝 概要（Summary）
この記事では〇〇について紹介します。初心者にもわかりやすく解説します。

---

## 📌 目次（Table of Contents）
1. はじめに  
2. 背景・基本情報  
3. メイン内容  
4. まとめ  
5. 参考リンク  

---

## 1. はじめに
ここでは、記事の背景や目的を簡単に書きます。

---

## 2. 背景・基本情報
- 用語の説明  
- なぜこれが重要なのか  
- 前提知識など  

---

## 3. メイン内容

### 🔹 トピック1
詳細な説明をここに。

### 🔹 トピック2
図やコードがあればここに挿入。

\`\`\`javascript
// これはコードの例
console.log("Hello, world!");
\`\`\`

---

## 4. まとめ
この記事で学んだことや、次に取るべきアクションなどをまとめます。

---

## 5. 参考リンク
- [公式サイト](https://example.com)
- [関連記事](https://example.com)
`;


export default function CreateOrEditModal({
  type,
  data,
  labels,
  technologies,
  onClose,
  onSave,
  onCreateLabel,
  onCreateTechnologie
}: CreateOrEditModalProps) {
  const [formData, setFormData] = useState<ArticleType | WorkType>(
    data ||
    (type === "article"
      ? ({
        id: 0,
        title: "",
        date: new Date().toISOString(),
        content: templateContent,
        labelIds: [],
        technologieIds: [],
        authorIds: [],
        type: "Preview",
      } as ArticleType)
      : ({
        id: 0,
        name: "",
        date: new Date().toISOString(),
        url: "",
        githubUrl: "",
        icon: "",
        description: "",
        labelIds: [],
        technologieIds: [],
        authorIds: [],
        type: "Public",
      } as WorkType)),
  )

  const [userId, setUserId] = useState(null);

  const [selectedLabelIds, setSelectedLabelIds] = useState<number[]>(data?.labelIds || [])
  const [newLabelName, setNewLabelName] = useState("")
  const [selectedTechnologieIds, setSelectedTechnologieIds] = useState<number[]>(data?.technologieIds || [])
  const [newTechnologieName, setNewTechnologieName] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [iconWithTimestamp, setIconWithTimestamp] = useState<string | null>(null)

  const router = useRouter();

  useEffect(() => {
    const checkUserExists = async () => {

      try {
        const res = await fetch("/api/user/check");
        const data = await res.json();

        setUserId(data.userId);
        if (!data.exists) {
          // ✅ ユーザーが存在しない場合 `/user/createAccount` にリダイレクト
          router.push("/user/createAccount");
        }
      } catch (error) {
        console.error("ユーザーの存在チェックに失敗しました:", error);
      }
    };

    checkUserExists()

    if (data && "icon" in data && data.icon) {
      setIconWithTimestamp(`${data.icon}?t=${Date.now()}`)
    }
  }, [data])

  type SearchOptionsWithRecursive = SearchOptions & {
    recursive?: boolean;
  };

  const deleteUserFiles = async (userId: string, deleteId: number, fileName: string) => {
    const listOptions: SearchOptionsWithRecursive | undefined =
      fileName === "articles" ? { recursive: true } : undefined;

    const { data, error } = await supabase.storage
      .from(fileName)
      .list(`${userId}/${deleteId}`, listOptions);

    if (error) {
      console.error("ファイル一覧取得エラー:", error.message);
      return;
    }

    const filePaths = data?.map(file => `${userId}/${deleteId}/${file.name}`) || [];

    console.log("削除対象ファイル:", filePaths)

    if (filePaths.length === 0) {
      console.log(`[${fileName}] 削除対象のファイルなし`);
      return;
    }

    const { error: deleteError } = await supabase.storage
      .from(fileName)
      .remove(filePaths);

    if (deleteError) {
      console.error(`[${fileName}] 削除エラー:`, deleteError.message);
    } else {
      console.log(`[${fileName}] すべてのファイルを削除しました`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setErrors({ ...errors, [name]: "" })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    let extension = file.type.split("/")[1] || "png";
    extension = extension.replace("x-", "");
    const filePath = `${userId}/${(formData as WorkType).id}/avatar.${extension}`;

    // 1. Supabase Storage にアップロード
    const { error } = await supabase.storage
      .from("work-icon") // ← ストレージバケット名
      .upload(filePath, file, {
        upsert: true, // 上書き許可
      });

    if (error) {
      console.error("画像のアップロードに失敗:", error.message);
      return;
    }

    // 2. パブリックURLを取得
    const { publicUrl } = supabase.storage
      .from("work-icon")
      .getPublicUrl(filePath).data;


    if ("icon" in formData) {
      setIconWithTimestamp(`${publicUrl}?t=${Date.now()}`);
    }

    // 3. URLをプロフィールのiconに設定（DB保存も可能）
    setFormData((prev) => ({
      ...prev,
      icon: publicUrl,
    }));
  };

  const handleLabelToggle = (labelId: number) => {
    setSelectedLabelIds((prev) => (prev.includes(labelId) ? prev.filter((id) => id !== labelId) : [...prev, labelId]))
  }

  const handleTechnologieToggle = (technologieId: number) => {
    setSelectedTechnologieIds((prev) => (prev.includes(technologieId) ? prev.filter((id) => id !== technologieId) : [...prev, technologieId]))
  }

  const handleCreateLabel = async () => {
    if (newLabelName.trim()) {
      try {
        // 1. ラベルをAPIに即POST
        const res = await fetch("/api/labels", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newLabelName.trim() }),
        });

        if (!res.ok) throw new Error("ラベル作成に失敗");

        // 2. 本物のラベルIDを取得
        const createdLabel: LabelType = await res.json();

        // 3. 選択リストに追加
        setSelectedLabelIds(prev => [...prev, createdLabel.id]);

        // 4. ラベルリストにも追加（状態管理が必要）
        onCreateLabel(createdLabel); // ←親コンポーネントの配列に追加させる

        setNewLabelName("");
      } catch (error) {
        console.error("ラベル作成エラー:", error);
      }
    }
  };

  const handleCreateTechnologie = async () => {
    if (newTechnologieName.trim()) {
      try {
        // 1. 技術をAPIに即POST
        const res = await fetch("/api/technologies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newTechnologieName.trim() }),
        });

        if (!res.ok) throw new Error("技術の作成に失敗");

        // 2. DBから返された本物のIDを取得
        const createdTechnologie: TechnologieType = await res.json();

        // 3. 選択中の技術IDに追加
        setSelectedTechnologieIds(prev => [...prev, createdTechnologie.id]);

        // 4. 親コンポーネントにも追加を伝える
        onCreateTechnologie(createdTechnologie);

        setNewTechnologieName("");
      } catch (error) {
        console.error("技術作成エラー:", error);
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (type === "article") {
      if (!("title" in formData) || !formData.title) newErrors.title = "タイトルは必須です"
    } else {
      if (!("name" in formData) || !formData.name) newErrors.name = "名前は必須です"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "入力エラー",
        description: "必須項目をすべて入力してください。",
        variant: "destructive",
      });
      return;
    }

    const newLabelIds = selectedLabelIds.filter((id) => id >= 1_000_000_000_000);
    const finalLabelIds = selectedLabelIds.filter(id =>
      labels.some(label => label.id === id)
    );

    for (const tempId of newLabelIds) {
      const labelObj = labels.find((lbl) => lbl.id === tempId);
      if (!labelObj) continue;

      try {
        const res = await fetch("/api/labels", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: labelObj.name }),
        });
        if (!res.ok) throw new Error("ラベル作成に失敗");

        const createdLabel = await res.json();
        finalLabelIds.push(createdLabel.id);
      } catch (error) {
        toast({
          title: "カテゴリの作成に失敗しました",
          description: `${labelObj?.name} は既に存在するか、問題が発生しました。画面を再読み込みして再試行してください。`,
          variant: "destructive",
        });
        console.error(error);
        return;
      }
    }

    const newTechnologieIds = selectedTechnologieIds.filter((id) => id >= 1_000_000_000_000);
    const finalTechnologieIds = selectedTechnologieIds.filter(id =>
      technologies.some(tech => tech.id === id)
    );

    for (const tempId of newTechnologieIds) {
      const technologieObj = technologies.find((tech) => tech.id === tempId);
      if (!technologieObj) continue;

      try {
        const res = await fetch("/api/technologies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: technologieObj.name }),
        });
        if (!res.ok) throw new Error("技術作成に失敗");

        const createdTechnologie = await res.json();
        finalTechnologieIds.push(createdTechnologie.id);
      } catch (error) {
        toast({
          title: "技術の作成に失敗しました",
          description: `${technologieObj?.name} は既に存在するか、問題が発生しました。画面を再読み込みして再試行してください。`,
          variant: "destructive",
        });
        console.error(error);
        return;
      }
    }

    const endpoint = type === "article" ? "/api/articles" : "/api/works";
    const method = data ? "PATCH" : "POST";
    const url = data ? `${endpoint}/${data.id}` : endpoint;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          labelIds: finalLabelIds,
          technologieIds: finalTechnologieIds,
        }),
      });

      if (!res.ok) throw new Error(`${method} request failed`);

      const result = await res.json();

      toast({
        title: data ? "更新成功" : "作成成功",
        description: `${type === "article" ? "記事" : "作品"}が正常に${data ? "更新" : "作成"}されました。`,
      });
      onSave(type, result, data ? "edit" : "create");
      if (type === "article" && data) {
        router.push(`/dashboard/articles/${result.articleId}`);
      } else if (type === "article") {
        router.push(`/dashboard/articles/${result.id}`);
      } else {
        onClose();
      }
    } catch (error) {
      console.error("保存に失敗しました:", error);
      toast({
        title: "保存に失敗しました",
        description: "もう一度お試しください。画面を更新することで改善する場合もあります。",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (ownerId : string, deleteId: number) => {
    if (!data) return

    setIsDeleting(true)
    setError(null)

    const endpoint = type === "article" ? "/api/articles" : "/api/works"
    const url = `${endpoint}/${data.id}`

    if (ownerId) {
      if (type === "article") {
        deleteUserFiles(ownerId, deleteId, "articles");
      } else {
        deleteUserFiles(ownerId, deleteId, "work-icon");
      }
    }

    try {
      const res = await fetch(url, {
        method: "DELETE",
      })

      if (!res.ok) {
        throw new Error("削除に失敗しました")
      }
      onSave(type, data, "delete")

      onClose()

    } catch (error) {
      console.error("削除エラー:", error)
      setError(error instanceof Error ? error.message : "削除中にエラーが発生しました")
    } finally {
      setIsDeleting(false)
    }
  }


  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {data ? "編集" : "新規作成"}: {type === "article" ? "記事" : "作品"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {type === "article" ? (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  タイトル
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={(formData as ArticleType).title}
                  onChange={handleChange}
                  className="col-span-3"
                />
                {errors.title && <p className="text-red-500 text-sm col-start-2 col-span-3">{errors.title}</p>}
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  名前
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={(formData as WorkType).name}
                  onChange={handleChange}
                  className="col-span-3"
                />
                {errors.name && <p className="text-red-500 text-sm col-start-2 col-span-3">{errors.name}</p>}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="url" className="text-right">
                  URL
                </Label>
                <Input
                  id="url"
                  name="url"
                  value={(formData as WorkType).url ?? ""}
                  onChange={handleChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="githubUrl" className="text-right">
                  GitHub URL
                </Label>
                <Input
                  id="githubUrl"
                  name="githubUrl"
                  value={(formData as WorkType).githubUrl ?? ""}
                  onChange={handleChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  説明
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={(formData as WorkType).description ?? ""}
                  onChange={handleChange}
                  className="col-span-3"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="icon" className="text-right">
                  アイコン
                </Label>
                <div className="col-span-3">
                  <Input
                    id="icon"
                    name="icon"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button variant="outline" onClick={() => document.getElementById("icon")?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    画像をアップロード
                  </Button>
                  {iconWithTimestamp && (
                    <div className="mt-2">
                      <Image
                        src={iconWithTimestamp || "/images/noimg.png"}
                        alt="Preview"
                        width={128}
                        height={128}
                        className="max-w-full h-auto max-h-32 object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  タイプ
                </Label>
                <select
                  id="type"
                  name="type"
                  value={data ? (data as WorkType).type : "Public"}
                  onChange={handleChange}
                  className="col-span-3 border rounded px-3 py-2"
                >
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                </select>
                <p className="text-xs text-gray-500 col-start-2 col-span-3">
                  ※誰でも閲覧可能またはメンバーのみ閲覧可能か選ぶことができます。
                </p>
              </div>
            </>
          )}

          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right">カテゴリ</Label>
            <div className="col-span-3 space-y-2">
              {labels.map((label) => (
                <div key={label.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`label-${label.id}`}
                    checked={selectedLabelIds.includes(label.id)}
                    onCheckedChange={() => handleLabelToggle(label.id)}
                  />
                  <Label htmlFor={`label-${label.id}`}>{label.name}</Label>
                </div>
              ))}
              <div className="flex items-center space-x-2 mt-2">
                <Input
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  placeholder="新規カテゴリ"
                  className="flex-grow"
                />
                <Button onClick={handleCreateLabel} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 items-start gap-4">
          <Label className="text-right">使用技術</Label>
          <div className="col-span-3 space-y-2">
            {technologies.map((technologie) => (
              <div key={technologie.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`technologie-${technologie.id}`}
                  checked={selectedTechnologieIds.includes(technologie.id)}
                  onCheckedChange={() => handleTechnologieToggle(technologie.id)}
                />
                <Label htmlFor={`technologie-${technologie.id}`}>{technologie.name}</Label>
              </div>
            ))}
            <div className="flex items-center space-x-2 mt-2">
              <Input
                value={newTechnologieName}
                onChange={(e) => setNewTechnologieName(e.target.value)}
                placeholder="新規ラベル"
                className="flex-grow"
              />
              <Button onClick={handleCreateTechnologie} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          {data && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash className="mr-2 h-4 w-4" />
                  削除
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
                  <AlertDialogDescription>
                    この操作は取り消せません。{type === "article" ? "記事" : "作品"}
                    を削除すると、関連するすべてのデータが完全に削除されます。
                  </AlertDialogDescription>
                </AlertDialogHeader>

                {error && <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm mb-4">{error}</div>}

                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>キャンセル</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.preventDefault() // デフォルトの閉じる動作を防止
                      if(type==="article"){
                        handleDelete((formData as ArticleType).authorIds[0], (formData as WorkType).id)
                      }else{
                        handleDelete((formData as WorkType).authorIds[0], (formData as WorkType).id)
                      }
                    }}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                  >
                    {isDeleting ? (
                      <>
                        <span className="animate-pulse">削除中...</span>
                      </>
                    ) : (
                      "削除する"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {type === "article" ? (
            <Button onClick={handleSubmit}>
              <ChevronLast />
              次へ
            </Button>
          ) : (
            <Button onClick={handleSubmit}>
              <Save className="mr-2 h-4 w-4" />
              保存
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog >
  )
}

