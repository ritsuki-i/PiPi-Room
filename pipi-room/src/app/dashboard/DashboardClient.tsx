"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Plus, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import CreateOrEditModal from "./CreateOrEditModal"
import type { UserType, ArticleType, WorkType, LabelType, TechnologieType } from "@/types"

type Props = {
    mode: "self" | "all";
    initialArticles: ArticleType[]
    initialWorks: WorkType[]
    initialLabels: LabelType[]
    initialTechnologies: TechnologieType[]
}

export default function DashboardClient({ mode, initialArticles, initialWorks, initialLabels, initialTechnologies }: Props) {
    const [articles, setArticles] = useState<ArticleType[]>(initialArticles)
    const [works, setWorks] = useState<WorkType[]>(initialWorks)
    const [labels, setLabels] = useState<LabelType[]>(initialLabels)
    const [technologies, setTechnologies] = useState<TechnologieType[]>(initialTechnologies)
    const [showModal, setShowModal] = useState(false)
    const [editTarget, setEditTarget] = useState<{
        type: "article" | "work"
        data: ArticleType | WorkType | null
    } | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [userMap, setUserMap] = useState<Record<string, string>>({})
    const itemsPerPage = 5

    const filteredWorks = useMemo(() => {
        return works.filter(work =>
            work.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            work.authorIds?.some(authorId =>
                userMap[authorId]?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        )
    }, [works, searchTerm, userMap])

    const filteredArticles = useMemo(() => {
        return articles.filter(article =>
            article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.authorIds?.some(authorId =>
                userMap[authorId]?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        )
    }, [articles, searchTerm, userMap])

    const paginatedArticles = filteredArticles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const paginatedWorks = filteredWorks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    useEffect(() => {
        setCurrentPage(1)
    }, []) //Fixed unnecessary dependency

    const handleCreateArticle = () => {
        setEditTarget({ type: "article", data: null })
        setShowModal(true)
    }

    const handleCreateWork = () => {
        setEditTarget({ type: "work", data: null })
        setShowModal(true)
    }

    const handleEdit = (type: "article" | "work", item: ArticleType | WorkType) => {
        setEditTarget({ type, data: item })
        setShowModal(true)
    }

    const handleSave = (type: "article" | "work", newData: ArticleType | WorkType, mode: "create" | "edit" | "delete") => {
        setShowModal(false)
        setEditTarget(null)

        if (type === "article") {
            if (mode === "delete") {
                setArticles((prev) => prev.filter((a) => a.id !== newData.id))
            } else if (mode === "edit") {
                setArticles((prev) => prev.map((a) => (a.id === newData.id ? newData as ArticleType : a)))
            } else {
                setArticles((prev) => [...prev, newData as ArticleType])
            }
        } else {
            if (mode === "delete") {
                setWorks((prev) => prev.filter((w) => w.id !== newData.id))
            } else if (mode === "edit") {
                setWorks((prev) => prev.map((w) => (w.id === newData.id ? newData as WorkType : w)))
            } else {
                setWorks((prev) => [...prev, newData as WorkType])
            }
        }
    }

    const handleCreateLabel = (label: LabelType) => {
        setLabels((prev) => [...prev, label])
    }

    const handleCreateTechnologie = (technologie: TechnologieType) => {
        setTechnologies((prev) => [...prev, technologie])
    }

    useEffect(() => {
        const fetchUsers = async () => {
            const res = await fetch("/api/user")
            const data = await res.json()
            const map: Record<string, string> = {}
            data.forEach((user: UserType) => {
                map[user.id] = user.name
            })
            setUserMap(map)
        }
        fetchUsers()
    }, [])

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">ダッシュボード</h1>

            <div className="flex justify-between items-center mb-6">
                {mode === "self" && (
                    <div className="flex space-x-2">
                        <Button onClick={handleCreateArticle}>
                            <Plus className="mr-2 h-4 w-4" /> 記事作成
                        </Button>
                        <Button onClick={handleCreateWork}>
                            <Plus className="mr-2 h-4 w-4" /> 作品作成
                        </Button>
                    </div>
                )}
                <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="検索..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-semibold mb-4">{mode === "self" ? "あなたの記事" : "すべての記事"}</h2>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {mode === "all" && <TableHead>作成者</TableHead>}
                                <TableHead>タイトル</TableHead>
                                <TableHead>日付</TableHead>
                                <TableHead>編集</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedArticles.map((article) => (
                                <TableRow key={article.id}>
                                    {mode === "all" && (
                                        <TableCell>
                                            {article.authorIds?.map(id => userMap[id] || "不明").join(", ")}
                                        </TableCell>
                                    )}
                                    <TableCell>{article.title}</TableCell>
                                    <TableCell>{article.date}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" onClick={() => handleEdit("article", article)}>
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold mb-4">{mode === "self" ? "あなたの制作物" : "すべての制作物"}</h2>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {mode === "all" && <TableHead>作成者</TableHead>}
                                <TableHead>名前</TableHead>
                                <TableHead>日付</TableHead>
                                {mode === "self" ? <TableHead>URL</TableHead> : null}
                                <TableHead>編集</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedWorks.map((work) => (
                                <TableRow key={work.id}>
                                    {mode === "all" && (
                                        <TableCell>
                                            {work.authorIds?.map(id => userMap[id] || "不明").join(", ")}
                                        </TableCell>
                                    )}
                                    <TableCell>{work.name}</TableCell>
                                    <TableCell>{work.date}</TableCell>
                                    {mode === "self" ? (
                                        <TableCell>
                                            {work.url ? (
                                                <a href={work.url} className="text-blue-500 hover:underline">
                                                    {work.url}
                                                </a>
                                            ) : (
                                                "No URL"
                                            )}
                                        </TableCell>
                                    ) : null}
                                    <TableCell>
                                        <Button variant="ghost" onClick={() => handleEdit("work", work)}>
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <Pagination className="mt-4">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => currentPage > 1 && setCurrentPage((prev) => prev - 1)}
                            aria-disabled={currentPage === 1} // ✅ 代わりに `aria-disabled` を使う
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""} // ✅ 無効化のスタイルを適用
                        />
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationLink isActive>{currentPage}</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationNext
                            onClick={() =>
                                currentPage < Math.ceil(Math.max(filteredArticles.length, filteredWorks.length) / itemsPerPage) &&
                                setCurrentPage((prev) => prev + 1)
                            }
                            aria-disabled={
                                currentPage === Math.ceil(Math.max(filteredArticles.length, filteredWorks.length) / itemsPerPage)
                            } // ✅ `aria-disabled` を使う
                            className={
                                currentPage === Math.ceil(Math.max(filteredArticles.length, filteredWorks.length) / itemsPerPage)
                                    ? "pointer-events-none opacity-50"
                                    : ""
                            } // ✅ スタイルでクリックを無効化
                        />

                    </PaginationItem>
                </PaginationContent>
            </Pagination>

            {showModal && editTarget && (
                <CreateOrEditModal
                    type={editTarget.type}
                    data={editTarget.data}
                    labels={labels}
                    technologies={technologies}
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                    onCreateLabel={handleCreateLabel}
                    onCreateTechnologie={handleCreateTechnologie}
                />
            )}
        </div>
    )
}

