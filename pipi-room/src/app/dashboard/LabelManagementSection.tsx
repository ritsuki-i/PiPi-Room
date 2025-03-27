"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Pencil, Trash2, Tag, Code } from "lucide-react"
import { LabelType, TechnologieType } from "@/types"
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

    useEffect(() => {
        fetchItems()
    }, [])

    const fetchItems = async () => {
        const [labelRes, techRes] = await Promise.all([
            fetch("/api/labels"),
            fetch("/api/technologies"),
        ])
        setLabels(await labelRes.json())
        setTechnologies(await techRes.json())
    }

    const updateItem = async (type: "label" | "technology", id: number, name: string) => {
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
    }

    const deleteSelectedItems = async () => {
        for (const id of selectedLabelIds) {
            await fetch(`/api/labels/${id}`, { method: "DELETE" })
        }
        for (const id of selectedTechIds) {
            await fetch(`/api/technologies/${id}`, { method: "DELETE" })
        }
        toast({ title: "削除完了", description: "選択した項目を削除しました。" })
        setSelectedLabelIds([])
        setSelectedTechIds([])
        fetchItems()
    }

    const createItem = async (type: "label" | "technology") => {
        const name = type === "label" ? newLabelName : newTechName
        if (!name.trim()) return
        await fetch(`/api/${type === "label" ? "labels" : "technologies"}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
        })
        toast({ title: "作成完了", description: `${type === "label" ? "カテゴリ" : "技術"}を追加しました。` })
        type === "label" ? setNewLabelName("") : setNewTechName("")
        fetchItems()
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">プロジェクト設定</h1>

            <div className="grid md:grid-cols-2 gap-8">
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
                            className="flex gap-2 mb-6"
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
                            <Button type="submit" disabled={!newLabelName.trim()}>
                                <Plus className="w-4 h-4 mr-1" />
                                追加
                            </Button>
                        </form>

                        {/* カテゴリリスト */}
                        <div className="space-y-3">
                            {labels.length === 0 ? (
                                <p className="text-sm text-muted-foreground italic">カテゴリがありません</p>
                            ) : (
                                labels.map((label) => (
                                    <div
                                        key={label.id}
                                        className={`flex items-center gap-2 p-3 rounded-md border ${selectedLabelIds.includes(label.id) ? "bg-muted border-primary" : ""
                                            }`}
                                    >
                                        <Checkbox
                                            checked={selectedLabelIds.includes(label.id)}
                                            onCheckedChange={() =>
                                                setSelectedLabelIds((prev) =>
                                                    prev.includes(label.id) ? prev.filter((id) => id !== label.id) : [...prev, label.id],
                                                )
                                            }
                                            className="data-[state=checked]:bg-primary"
                                        />

                                        {editLabelId === label.id ? (
                                            <form
                                                className="flex flex-1 gap-2"
                                                onSubmit={(e) => {
                                                    e.preventDefault()
                                                    updateItem("label", label.id, editLabelName)
                                                }}
                                            >
                                                <Input
                                                    value={editLabelName}
                                                    onChange={(e) => setEditLabelName(e.target.value)}
                                                    className="flex-1"
                                                    autoFocus
                                                />
                                                <Button type="submit" size="sm">
                                                    保存
                                                </Button>
                                            </form>
                                        ) : (
                                            <>
                                                <Badge variant="outline" className="flex-1 justify-start font-normal text-foreground">
                                                    {label.name}
                                                </Badge>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        setEditLabelId(label.id)
                                                        setEditLabelName(label.name)
                                                    }}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
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
                            className="flex gap-2 mb-6"
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
                            <Button type="submit" disabled={!newTechName.trim()}>
                                <Plus className="w-4 h-4 mr-1" />
                                追加
                            </Button>
                        </form>

                        {/* 技術リスト */}
                        <div className="space-y-3">
                            {technologies.length === 0 ? (
                                <p className="text-sm text-muted-foreground italic">使用技術がありません</p>
                            ) : (
                                technologies.map((tech) => (
                                    <div
                                        key={tech.id}
                                        className={`flex items-center gap-2 p-3 rounded-md border ${selectedTechIds.includes(tech.id) ? "bg-muted border-primary" : ""
                                            }`}
                                    >
                                        <Checkbox
                                            checked={selectedTechIds.includes(tech.id)}
                                            onCheckedChange={() =>
                                                setSelectedTechIds((prev) =>
                                                    prev.includes(tech.id) ? prev.filter((id) => id !== tech.id) : [...prev, tech.id],
                                                )
                                            }
                                            className="data-[state=checked]:bg-primary"
                                        />

                                        {editTechId === tech.id ? (
                                            <form
                                                className="flex flex-1 gap-2"
                                                onSubmit={(e) => {
                                                    e.preventDefault()
                                                    updateItem("technology", tech.id, editTechName)
                                                }}
                                            >
                                                <Input
                                                    value={editTechName}
                                                    onChange={(e) => setEditTechName(e.target.value)}
                                                    className="flex-1"
                                                    autoFocus
                                                />
                                                <Button type="submit" size="sm">
                                                    保存
                                                </Button>
                                            </form>
                                        ) : (
                                            <>
                                                <Badge variant="outline" className="flex-1 justify-start font-normal text-foreground">
                                                    {tech.name}
                                                </Badge>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        setEditTechId(tech.id)
                                                        setEditTechName(tech.name)
                                                    }}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 削除アクション */}
            <div className="mt-8 flex justify-end">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="destructive"
                            disabled={selectedLabelIds.length + selectedTechIds.length === 0}
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
                                <div className="mt-4 space-y-2">
                                    {selectedLabelIds.length > 0 && (
                                        <div>
                                            <h4 className="font-medium mb-1">カテゴリ:</h4>
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
                                            <h4 className="font-medium mb-1">技術:</h4>
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
