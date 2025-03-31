"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Pencil, Trash2, Tag, Code, X, Check, Search } from "lucide-react"
import type { LabelType, TechnologieType } from "@/types"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function LabelTechnologyManager() {
  const { toast } = useToast()

  const [labels, setLabels] = useState<LabelType[]>([])
  const [technologies, setTechnologies] = useState<TechnologieType[]>([])

  const [editLabelId, setEditLabelId] = useState<number | null>(null)
  const [editTechId, setEditTechId] = useState<number | null>(null)

  const [editLabelName, setEditLabelName] = useState("")
  const [editTechName, setEditTechName] = useState("")

  const [selectedLabelIds, setSelectedLabelIds] = useState<number[]>([])
  const [selectedTechIds, setSelectedTechIds] = useState<number[]>([])

  const [newLabelName, setNewLabelName] = useState("")
  const [newTechName, setNewTechName] = useState("")

  const [labelFilter, setLabelFilter] = useState("")
  const [techFilter, setTechFilter] = useState("")

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    setIsLoading(true)
    try {
      const [labelRes, techRes] = await Promise.all([fetch("/api/labels"), fetch("/api/technologies")])
      setLabels(await labelRes.json())
      setTechnologies(await techRes.json())
    } catch (error) {
      toast({
        title: "エラーが発生しました",
        description: "データの取得に失敗しました。",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateItem = async (type: "label" | "technology", id: number, name: string) => {
    if (!name.trim()) {
      toast({
        title: "エラー",
        description: "名前を入力してください。",
        variant: "destructive",
      })
      return
    }

    try {
      await fetch(`/api/${type === "label" ? "labels" : "technologies"}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      toast({ title: "更新完了", description: `${type === "label" ? "カテゴリ" : "技術"}を更新しました。` })
      fetchItems()
      if (type === "label") {
        setEditLabelId(null)
        setEditLabelName("")
      } else {
        setEditTechId(null)
        setEditTechName("")
      }
    } catch (error) {
      toast({
        title: "エラーが発生しました",
        description: "更新に失敗しました。",
        variant: "destructive",
      })
    }
  }

  const deleteSelectedItems = async () => {
    try {
      const promises = [
        ...selectedLabelIds.map((id) => fetch(`/api/labels/${id}`, { method: "DELETE" })),
        ...selectedTechIds.map((id) => fetch(`/api/technologies/${id}`, { method: "DELETE" })),
      ]

      await Promise.all(promises)

      toast({ title: "削除完了", description: "選択した項目を削除しました。" })
      setSelectedLabelIds([])
      setSelectedTechIds([])
      fetchItems()
    } catch (error) {
      toast({
        title: "エラーが発生しました",
        description: "削除に失敗しました。",
        variant: "destructive",
      })
    }
  }

  const createItem = async (type: "label" | "technology") => {
    const name = type === "label" ? newLabelName : newTechName
    if (!name.trim()) {
      toast({
        title: "エラー",
        description: "名前を入力してください。",
        variant: "destructive",
      })
      return
    }

    try {
      await fetch(`/api/${type === "label" ? "labels" : "technologies"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      toast({ title: "作成完了", description: `${type === "label" ? "カテゴリ" : "技術"}を追加しました。` })
      if (type === "label") {
        setNewLabelName("")
      } else {
        setNewTechName("")
      }
      fetchItems()
    } catch (error) {
      toast({
        title: "エラーが発生しました",
        description: "作成に失敗しました。",
        variant: "destructive",
      })
    }
  }

  const filteredLabels = labels.filter((label) => label.name.toLowerCase().includes(labelFilter.toLowerCase()))

  const filteredTechnologies = technologies.filter((tech) => tech.name.toLowerCase().includes(techFilter.toLowerCase()))

  const selectAllLabels = () => {
    if (selectedLabelIds.length === filteredLabels.length) {
      setSelectedLabelIds([])
    } else {
      setSelectedLabelIds(filteredLabels.map((label) => label.id))
    }
  }

  const selectAllTechs = () => {
    if (selectedTechIds.length === filteredTechnologies.length) {
      setSelectedTechIds([])
    } else {
      setSelectedTechIds(filteredTechnologies.map((tech) => tech.id))
    }
  }

  // For mobile view
  const renderItemList = (
    type: "label" | "technology",
    items: LabelType[] | TechnologieType[],
    selectedIds: number[],
    setSelectedIds: (ids: number[]) => void,
    editId: number | null,
    setEditId: (id: number | null) => void,
    editName: string,
    setEditName: (name: string) => void,
  ) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          {type === "label" ? "カテゴリ" : "技術"}がありません
        </div>
      )
    }

    return (
      <div className="space-y-3 mt-4">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-center gap-2 p-3 rounded-md border ${
              selectedIds.includes(item.id) ? "bg-muted border-primary" : ""
            }`}
          >
            <Checkbox
              checked={selectedIds.includes(item.id)}
              onCheckedChange={() =>
                setSelectedIds(
                  selectedIds.includes(item.id)
                    ? selectedIds.filter((id) => id !== item.id)
                    : [...selectedIds, item.id],
                )
              }
              className="data-[state=checked]:bg-primary"
            />

            {editId === item.id ? (
              <form
                className="flex flex-1 gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  updateItem(type, item.id, editName)
                }}
              >
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1" autoFocus />
                <div className="flex gap-1">
                  <Button type="submit" size="icon" variant="ghost" className="h-9 w-9">
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button type="button" size="icon" variant="ghost" className="h-9 w-9" onClick={() => setEditId(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <Badge variant="outline" className="flex-1 justify-start font-normal text-foreground">
                  {item.name}
                </Badge>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setEditId(item.id)
                    setEditName(item.name)
                  }}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">プロジェクト設定</h1>

      {/* Desktop View */}
      <div className="hidden md:grid md:grid-cols-2 gap-8">
        {/* カテゴリ管理 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              カテゴリ管理
            </CardTitle>
            <CardDescription>プロジェクトを分類するためのカテゴリを管理します</CardDescription>
          </CardHeader>
          <CardContent>
            {/* 新規作成フォーム */}
            <form
              className="flex gap-2 mb-4"
              onSubmit={(e) => {
                e.preventDefault()
                createItem("label")
              }}
            >
              <Input
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                placeholder="新しいカテゴリ名"
                className="flex-1"
              />
              <Button type="submit" disabled={!newLabelName.trim() || isLoading}>
                <Plus className="w-4 h-4 mr-1" />
                追加
              </Button>
            </form>

            {/* 検索とバッチ操作 */}
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={labelFilter}
                  onChange={(e) => setLabelFilter(e.target.value)}
                  placeholder="カテゴリを検索..."
                  className="pl-8"
                />
              </div>
              <Button variant="outline" size="sm" onClick={selectAllLabels} disabled={filteredLabels.length === 0}>
                {selectedLabelIds.length === filteredLabels.length && filteredLabels.length > 0 ? "全解除" : "全選択"}
              </Button>
            </div>

            {/* カテゴリリスト */}
            <ScrollArea className="h-[320px] pr-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                renderItemList(
                  "label",
                  filteredLabels,
                  selectedLabelIds,
                  setSelectedLabelIds,
                  editLabelId,
                  setEditLabelId,
                  editLabelName,
                  setEditLabelName,
                )
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* 使用技術管理 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              使用技術管理
            </CardTitle>
            <CardDescription>プロジェクトで使用している技術を管理します</CardDescription>
          </CardHeader>
          <CardContent>
            {/* 新規作成フォーム */}
            <form
              className="flex gap-2 mb-4"
              onSubmit={(e) => {
                e.preventDefault()
                createItem("technology")
              }}
            >
              <Input
                value={newTechName}
                onChange={(e) => setNewTechName(e.target.value)}
                placeholder="新しい技術名"
                className="flex-1"
              />
              <Button type="submit" disabled={!newTechName.trim() || isLoading}>
                <Plus className="w-4 h-4 mr-1" />
                追加
              </Button>
            </form>

            {/* 検索とバッチ操作 */}
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={techFilter}
                  onChange={(e) => setTechFilter(e.target.value)}
                  placeholder="技術を検索..."
                  className="pl-8"
                />
              </div>
              <Button variant="outline" size="sm" onClick={selectAllTechs} disabled={filteredTechnologies.length === 0}>
                {selectedTechIds.length === filteredTechnologies.length && filteredTechnologies.length > 0
                  ? "全解除"
                  : "全選択"}
              </Button>
            </div>

            {/* 技術リスト */}
            <ScrollArea className="h-[320px] pr-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                renderItemList(
                  "technology",
                  filteredTechnologies,
                  selectedTechIds,
                  setSelectedTechIds,
                  editTechId,
                  setEditTechId,
                  editTechName,
                  setEditTechName,
                )
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <Tabs defaultValue="labels" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4 sticky top-0 z-10 bg-background">
            <TabsTrigger value="labels" className="flex items-center gap-2 py-3">
              <Tag className="h-4 w-4" />
              <span>カテゴリ</span>
              {selectedLabelIds.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {selectedLabelIds.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="technologies" className="flex items-center gap-2 py-3">
              <Code className="h-4 w-4" />
              <span>使用技術</span>
              {selectedTechIds.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {selectedTechIds.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="labels" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <Card>
              <CardContent className="pt-6">
                {/* 新規作成フォーム */}
                <form
                  className="flex gap-2 mb-4"
                  onSubmit={(e) => {
                    e.preventDefault()
                    createItem("label")
                  }}
                >
                  <Input
                    value={newLabelName}
                    onChange={(e) => setNewLabelName(e.target.value)}
                    placeholder="新しいカテゴリ名"
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!newLabelName.trim() || isLoading}>
                    <Plus className="w-4 h-4 mr-1" />
                    追加
                  </Button>
                </form>

                {/* 検索とバッチ操作 */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={labelFilter}
                      onChange={(e) => setLabelFilter(e.target.value)}
                      placeholder="カテゴリを検索..."
                      className="pl-8"
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={selectAllLabels} disabled={filteredLabels.length === 0}>
                    {selectedLabelIds.length === filteredLabels.length && filteredLabels.length > 0
                      ? "全解除"
                      : "全選択"}
                  </Button>
                </div>

                {/* カテゴリリスト */}
                <div className="max-h-[60vh] overflow-y-auto pr-1">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-40">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    renderItemList(
                      "label",
                      filteredLabels,
                      selectedLabelIds,
                      setSelectedLabelIds,
                      editLabelId,
                      setEditLabelId,
                      editLabelName,
                      setEditLabelName,
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="technologies" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <Card>
              <CardContent className="pt-6">
                {/* 新規作成フォーム */}
                <form
                  className="flex gap-2 mb-4"
                  onSubmit={(e) => {
                    e.preventDefault()
                    createItem("technology")
                  }}
                >
                  <Input
                    value={newTechName}
                    onChange={(e) => setNewTechName(e.target.value)}
                    placeholder="新しい技術名"
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!newTechName.trim() || isLoading}>
                    <Plus className="w-4 h-4 mr-1" />
                    追加
                  </Button>
                </form>

                {/* 検索とバッチ操作 */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={techFilter}
                      onChange={(e) => setTechFilter(e.target.value)}
                      placeholder="技術を検索..."
                      className="pl-8"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllTechs}
                    disabled={filteredTechnologies.length === 0}
                  >
                    {selectedTechIds.length === filteredTechnologies.length && filteredTechnologies.length > 0
                      ? "全解除"
                      : "全選択"}
                  </Button>
                </div>

                {/* 技術リスト */}
                <div className="max-h-[60vh] overflow-y-auto pr-1">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-40">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    renderItemList(
                      "technology",
                      filteredTechnologies,
                      selectedTechIds,
                      setSelectedTechIds,
                      editTechId,
                      setEditTechId,
                      editTechName,
                      setEditTechName,
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 削除アクション - モバイル用 */}
        <div className="mt-6 sticky bottom-4 flex justify-center md:hidden">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={selectedLabelIds.length + selectedTechIds.length === 0 || isLoading}
                className="gap-2 shadow-lg"
              >
                <Trash2 className="w-4 h-4" />
                選択した項目を削除
                {selectedLabelIds.length + selectedTechIds.length > 0 && (
                  <Badge variant="outline" className="ml-1 bg-destructive/20 border-destructive/30">
                    {selectedLabelIds.length + selectedTechIds.length}
                  </Badge>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
                <AlertDialogDescription>
                  以下の項目が削除されます：
                  <div className="mt-4 space-y-4">
                    {selectedLabelIds.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">カテゴリ:</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedLabelIds.map((id) => {
                            const l = labels.find((x) => x.id === id)
                            return (
                              <Badge key={`label-${id}`} variant="secondary">
                                {l?.name}
                              </Badge>
                            )
                          })}
                        </div>
                      </div>
                    )}
                    {selectedTechIds.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">技術:</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedTechIds.map((id) => {
                            const t = technologies.find((x) => x.id === id)
                            return (
                              <Badge key={`tech-${id}`} variant="secondary">
                                {t?.name}
                              </Badge>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>キャンセル</AlertDialogCancel>
                <AlertDialogAction onClick={deleteSelectedItems}>削除する</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* 削除アクション - デスクトップ用 */}
      <div className="mt-8 flex justify-end hidden md:flex">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              disabled={selectedLabelIds.length + selectedTechIds.length === 0 || isLoading}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              選択した項目を削除
              {selectedLabelIds.length + selectedTechIds.length > 0 && (
                <Badge variant="outline" className="ml-1 bg-destructive/20 border-destructive/30">
                  {selectedLabelIds.length + selectedTechIds.length}
                </Badge>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
              <AlertDialogDescription>
                以下の項目が削除されます：
                <div className="mt-4 space-y-4">
                  {selectedLabelIds.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">カテゴリ:</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedLabelIds.map((id) => {
                          const l = labels.find((x) => x.id === id)
                          return (
                            <Badge key={`label-${id}`} variant="secondary">
                              {l?.name}
                            </Badge>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  {selectedTechIds.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">技術:</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedTechIds.map((id) => {
                          const t = technologies.find((x) => x.id === id)
                          return (
                            <Badge key={`tech-${id}`} variant="secondary">
                              {t?.name}
                            </Badge>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>キャンセル</AlertDialogCancel>
              <AlertDialogAction onClick={deleteSelectedItems}>削除する</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

