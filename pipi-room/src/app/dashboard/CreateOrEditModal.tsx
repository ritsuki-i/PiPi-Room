"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Trash, Upload, Save, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import type { ArticleType, WorkType, LabelType } from "@/types"
import Image from "next/image"

interface CreateOrEditModalProps {
  type: "article" | "work"
  data: ArticleType | WorkType | null
  labels: LabelType[]
  onClose: () => void
  onSave: (type: "article" | "work", data: ArticleType | WorkType, isEdit: boolean) => void
  onCreateLabel: (label: LabelType) => void
}

export default function CreateOrEditModal({
  type,
  data,
  labels,
  onClose,
  onSave,
  onCreateLabel,
}: CreateOrEditModalProps) {
  const [formData, setFormData] = useState<ArticleType | WorkType>(
    data ||
    (type === "article"
      ? ({
        id: 0,
        title: "",
        date: "",
        content: "",
        labelIds: [],
        authorIds: [],
      } as ArticleType)
      : ({
        id: 0,
        name: "",
        date: "",
        url: "",
        icon: "",
        description: "",
        labelIds: [],
        authorIds: [],
      } as WorkType)),
  )

  const [selectedLabelIds, setSelectedLabelIds] = useState<number[]>(data?.labelIds || [])
  const [newLabelName, setNewLabelName] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    if (data && "icon" in data && data.icon) {
      setImagePreview(data.icon as string)
    }
  }, [data])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setErrors({ ...errors, [name]: "" })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
        setFormData({ ...formData, icon: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleLabelToggle = (labelId: number) => {
    setSelectedLabelIds((prev) => (prev.includes(labelId) ? prev.filter((id) => id !== labelId) : [...prev, labelId]))
  }

  const handleCreateLabel = () => {
    if (newLabelName.trim()) {
      const newLabel: LabelType = { id: Date.now(), name: newLabelName.trim() }
      onCreateLabel(newLabel)
      setSelectedLabelIds([...selectedLabelIds, newLabel.id])
      setNewLabelName("")
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (type === "article") {
      if (!("title" in formData) || !formData.title) newErrors.title = "タイトルは必須です"
      if (!("date" in formData) || !formData.date) newErrors.date = "日付は必須です"
      if (!("content" in formData) || !formData.content) newErrors.content = "内容は必須です"
    } else {
      if (!("name" in formData) || !formData.name) newErrors.name = "名前は必須です"
      if (!("date" in formData) || !formData.date) newErrors.date = "日付は必須です"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // 1. まだDBに無いラベルを一括作成
    //    ここでは「id が 1兆 (Date.now() など) 以上なら未登録」とみなす例
    const newLabelIds = selectedLabelIds.filter((id) => id >= 1_000_000_000_000);
    const existingLabelIds = selectedLabelIds.filter((id) => id < 1_000_000_000_000);

    const finalLabelIds = [...existingLabelIds];

    // 2. 未登録ラベルは /api/labels にPOSTして本物のIDを取得
    for (const tempId of newLabelIds) {
      // ラベル配列からラベル名を取得
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
        // createdLabel.id => DBで発行された本物のID
        finalLabelIds.push(createdLabel.id);
      } catch (error) {
        console.error(error);
      }
    }

    // 3. 記事/作品を保存
    const endpoint = type === "article" ? "/api/articles" : "/api/works";
    const method = data ? "PATCH" : "POST";
    const url = data ? `${endpoint}/${data.id}` : endpoint;

    try {

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          labelIds: finalLabelIds, // ここで本物のラベルIDを渡す
        }),
      });

      if (!res.ok) {
        throw new Error(`${method} request failed`);
      }

      const result = await res.json();
      onSave(type, result, !!data);
      onClose();
    } catch (error) {
      console.error("保存に失敗しました:", error);
    }
  };

  const handleDelete = async () => {
    if (!data) return; // そもそも新規作成時は削除不可
    if (!confirm("本当に削除しますか？")) return;

    const endpoint = type === "article" ? "/api/articles" : "/api/works";
    const url = `${endpoint}/${data.id}`;

    try {
      const res = await fetch(url, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("削除に失敗しました");
      }
      // 削除完了したら、モーダルを閉じるなど
      onClose();
      // 必要に応じて onSave() や リスト再読み込みの処理を呼ぶ場合もある
    } catch (error) {
      console.error("削除エラー:", error);
    }
  };




  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  日付
                </Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={(formData as ArticleType).date}
                  onChange={handleChange}
                  className="col-span-3"
                />
                {errors.date && <p className="text-red-500 text-sm col-start-2 col-span-3">{errors.date}</p>}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="content" className="text-right">
                  内容
                </Label>
                <Textarea
                  id="content"
                  name="content"
                  value={(formData as ArticleType).content}
                  onChange={handleChange}
                  className="col-span-3"
                  rows={5}
                />
                {errors.content && <p className="text-red-500 text-sm col-start-2 col-span-3">{errors.content}</p>}
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
                <Label htmlFor="date" className="text-right">
                  日付
                </Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={(formData as WorkType).date}
                  onChange={handleChange}
                  className="col-span-3"
                />
                {errors.date && <p className="text-red-500 text-sm col-start-2 col-span-3">{errors.date}</p>}
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
                  {imagePreview && (
                    <div className="mt-2">
                      <Image
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        width={128}
                        height={128} 
                        className="max-w-full h-auto max-h-32 object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right">ラベル</Label>
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
                  placeholder="新規ラベル"
                  className="flex-grow"
                />
                <Button onClick={handleCreateLabel} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          {data && (
            <Button variant="destructive" onClick={handleDelete}>
              <Trash className="mr-2 h-4 w-4" />
              削除
            </Button>
          )}
          <Button onClick={handleSubmit}>
            <Save className="mr-2 h-4 w-4" />
            保存
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

