"use client"

import { useState, useEffect } from "react"
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
import type { ArticleType, WorkType, LabelType } from "../../types"

type Props = {
    initialArticles: ArticleType[]
    initialWorks: WorkType[]
    initialLabels: LabelType[]
}

export default function DashboardClient({ initialArticles, initialWorks, initialLabels }: Props) {
    const [articles, setArticles] = useState<ArticleType[]>(initialArticles)
    const [works, setWorks] = useState<WorkType[]>(initialWorks)
    const [labels, setLabels] = useState<LabelType[]>(initialLabels)
    const [showModal, setShowModal] = useState(false)
    const [editTarget, setEditTarget] = useState<{
        type: "article" | "work"
        data: ArticleType | WorkType | null
    } | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5

    const filteredArticles = articles.filter((article) => article.title.toLowerCase().includes(searchTerm.toLowerCase()))

    const filteredWorks = works.filter((work) => work.name.toLowerCase().includes(searchTerm.toLowerCase()))

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

    const handleSave = (type: "article" | "work", newData: ArticleType | WorkType, isEdit: boolean) => {
        setShowModal(false)
        setEditTarget(null)

        if (type === "article") {
            if (isEdit) {
                setArticles((prev) => prev.map((a) => (a.id === newData.id ? (newData as ArticleType) : a)))
            } else {
                setArticles((prev) => [...prev, newData as ArticleType])
            }
        } else {
            if (isEdit) {
                setWorks((prev) => prev.map((w) => (w.id === newData.id ? (newData as WorkType) : w)))
            } else {
                setWorks((prev) => [...prev, newData as WorkType])
            }
        }
    }

    const handleCreateLabel = (label: LabelType) => {
        setLabels((prev) => [...prev, label])
    }

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">ダッシュボード</h1>

            <div className="flex justify-between items-center mb-6">
                <div className="flex space-x-2">
                    <Button onClick={handleCreateArticle}>
                        <Plus className="mr-2 h-4 w-4" /> 記事作成
                    </Button>
                    <Button onClick={handleCreateWork}>
                        <Plus className="mr-2 h-4 w-4" /> 作品作成
                    </Button>
                </div>
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
                    <h2 className="text-2xl font-semibold mb-4">あなたの記事</h2>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>タイトル</TableHead>
                                <TableHead>日付</TableHead>
                                <TableHead>編集</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedArticles.map((article) => (
                                <TableRow key={article.id}>
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
                    <h2 className="text-2xl font-semibold mb-4">あなたの作品</h2>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>名前</TableHead>
                                <TableHead>日付</TableHead>
                                <TableHead>URL</TableHead>
                                <TableHead>編集</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedWorks.map((work) => (
                                <TableRow key={work.id}>
                                    <TableCell>{work.name}</TableCell>
                                    <TableCell>{work.date}</TableCell>
                                    <TableCell>
                                        {work.url ? (
                                            <a href={work.url} className="text-blue-500 hover:underline">
                                                {work.url}
                                            </a>
                                        ) : (
                                            "No URL"
                                        )}
                                    </TableCell>
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
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                    onCreateLabel={handleCreateLabel}
                />
            )}
        </div>
    )
}

