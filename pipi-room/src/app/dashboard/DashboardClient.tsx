"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Plus, Edit2, ExternalLink, Calendar, User } from "lucide-react"
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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CreateOrEditModal from "./CreateOrEditModal"
import type { UserType, ArticleType, WorkType, LabelType, TechnologieType } from "@/types"

type Props = {
  mode: "self" | "all"
  initialArticles: ArticleType[]
  initialWorks: WorkType[]
  initialLabels: LabelType[]
  initialTechnologies: TechnologieType[]
}

export default function DashboardClient({
  mode,
  initialArticles,
  initialWorks,
  initialLabels,
  initialTechnologies,
}: Props) {
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
  const [activeTab, setActiveTab] = useState<"articles" | "works">("articles")
  const itemsPerPage = 5

  const filteredWorks = useMemo(() => {
    return works.filter(
      (work) =>
        work.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        work.authorIds?.some((authorId) => userMap[authorId]?.toLowerCase().includes(searchTerm.toLowerCase())),
    )
  }, [works, searchTerm, userMap])

  const filteredArticles = useMemo(() => {
    return articles.filter(
      (article) =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.authorIds?.some((authorId) => userMap[authorId]?.toLowerCase().includes(searchTerm.toLowerCase())),
    )
  }, [articles, searchTerm, userMap])

  const paginatedArticles = filteredArticles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const paginatedWorks = filteredWorks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const totalPages = useMemo(() => {
    const count = activeTab === "articles" ? filteredArticles.length : filteredWorks.length
    return Math.max(1, Math.ceil(count / itemsPerPage))
  }, [filteredArticles.length, filteredWorks.length, activeTab, itemsPerPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, activeTab])

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

  const handleSave = (
    type: "article" | "work",
    newData: ArticleType | WorkType,
    mode: "create" | "edit" | "delete",
  ) => {
    setShowModal(false)
    setEditTarget(null)

    if (type === "article") {
      if (mode === "delete") {
        setArticles((prev) => prev.filter((a) => a.id !== newData.id))
      } else if (mode === "edit") {
        setArticles((prev) => prev.map((a) => (a.id === newData.id ? (newData as ArticleType) : a)))
      } else {
        setArticles((prev) => [...prev, newData as ArticleType])
      }
    } else {
      if (mode === "delete") {
        setWorks((prev) => prev.filter((w) => w.id !== newData.id))
      } else if (mode === "edit") {
        setWorks((prev) => prev.map((w) => (w.id === newData.id ? (newData as WorkType) : w)))
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
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">ダッシュボード</h1>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
          {mode === "self" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" /> 新規作成
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleCreateArticle}>記事作成</DropdownMenuItem>
                <DropdownMenuItem onClick={handleCreateWork}>作品作成</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <div className="relative w-full sm:w-auto max-w-sm">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-full"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "articles" | "works")}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="articles">{mode === "self" ? "あなたの記事" : "すべての記事"}</TabsTrigger>
          <TabsTrigger value="works">{mode === "self" ? "あなたの制作物" : "すべての制作物"}</TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="space-y-4">
          {/* Desktop view for articles */}
          <div className="hidden md:block overflow-x-auto">
            <div className="min-w-full inline-block align-middle">
              <div className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {mode === "all" && <TableHead className="w-[20%]">作成者</TableHead>}
                      <TableHead className="w-[50%]">タイトル</TableHead>
                      <TableHead className="w-[20%]">日付</TableHead>
                      <TableHead className="w-[10%] text-right">編集</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedArticles.length > 0 ? (
                      paginatedArticles.map((article) => (
                        <TableRow key={article.id}>
                          {mode === "all" && (
                            <TableCell className="max-w-[200px] truncate">
                              {article.authorIds?.map((id) => userMap[id] || "不明").join(", ")}
                            </TableCell>
                          )}
                          <TableCell className="font-medium max-w-[400px] truncate">{article.title}</TableCell>
                          <TableCell className="whitespace-nowrap">{article.date}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit("article", article)}>
                              <Edit2 className="h-4 w-4" />
                              <span className="sr-only">編集</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={mode === "all" ? 4 : 3} className="text-center py-6 text-muted-foreground">
                          記事が見つかりません
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          {/* Mobile view for articles */}
          <div className="md:hidden space-y-4">
            {paginatedArticles.length > 0 ? (
              paginatedArticles.map((article) => (
                <Card key={article.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{article.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2 pt-0">
                    {mode === "all" && (
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <User className="h-3.5 w-3.5 mr-1" />
                        {article.authorIds?.map((id) => userMap[id] || "不明").join(", ")}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      {article.date}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 flex justify-end">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit("article", article)}>
                      <Edit2 className="h-3.5 w-3.5 mr-1" />
                      編集
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">記事が見つかりません</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="works" className="space-y-4">
          {/* Desktop view for works */}
          <div className="hidden md:block overflow-x-auto">
            <div className="min-w-full inline-block align-middle">
              <div className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {mode === "all" && <TableHead className="w-[20%]">作成者</TableHead>}
                      <TableHead className="w-[30%]">名前</TableHead>
                      <TableHead className="w-[15%]">日付</TableHead>
                      {mode === "self" && <TableHead className="w-[25%]">URL</TableHead>}
                      <TableHead className="w-[10%] text-right">編集</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedWorks.length > 0 ? (
                      paginatedWorks.map((work) => (
                        <TableRow key={work.id}>
                          {mode === "all" && (
                            <TableCell className="max-w-[200px] truncate">
                              {work.authorIds?.map((id) => userMap[id] || "不明").join(", ")}
                            </TableCell>
                          )}
                          <TableCell className="font-medium max-w-[300px] truncate">{work.name}</TableCell>
                          <TableCell className="whitespace-nowrap">{work.date}</TableCell>
                          {mode === "self" && (
                            <TableCell className="max-w-[200px] truncate">
                              {work.url ? (
                                <a
                                  href={work.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline flex items-center"
                                  title={work.url}
                                >
                                  <span className="truncate">{work.url}</span>
                                  <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
                                </a>
                              ) : (
                                <span className="text-muted-foreground">なし</span>
                              )}
                            </TableCell>
                          )}
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit("work", work)}>
                              <Edit2 className="h-4 w-4" />
                              <span className="sr-only">編集</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={mode === "all" ? 4 : mode === "self" ? 4 : 3}
                          className="text-center py-6 text-muted-foreground"
                        >
                          制作物が見つかりません
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          {/* Mobile view for works */}
          <div className="md:hidden space-y-4">
            {paginatedWorks.length > 0 ? (
              paginatedWorks.map((work) => (
                <Card key={work.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{work.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2 pt-0">
                    {mode === "all" && (
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <User className="h-3.5 w-3.5 mr-1" />
                        {work.authorIds?.map((id) => userMap[id] || "不明").join(", ")}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      {work.date}
                    </div>
                    {mode === "self" && work.url && (
                      <div className="flex items-center text-sm">
                        <a
                          href={work.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center"
                        >
                          <ExternalLink className="h-3.5 w-3.5 mr-1" />
                          {work.url}
                        </a>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0 flex justify-end">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit("work", work)}>
                      <Edit2 className="h-3.5 w-3.5 mr-1" />
                      編集
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">制作物が見つかりません</div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => currentPage > 1 && setCurrentPage((prev) => prev - 1)}
                  aria-disabled={currentPage === 1}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {/* Show first page */}
              {currentPage > 2 && (
                <PaginationItem>
                  <PaginationLink onClick={() => setCurrentPage(1)}>1</PaginationLink>
                </PaginationItem>
              )}

              {/* Show ellipsis if needed */}
              {currentPage > 3 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {/* Show previous page if not first */}
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationLink onClick={() => setCurrentPage(currentPage - 1)}>{currentPage - 1}</PaginationLink>
                </PaginationItem>
              )}

              {/* Current page */}
              <PaginationItem>
                <PaginationLink isActive>{currentPage}</PaginationLink>
              </PaginationItem>

              {/* Show next page if not last */}
              {currentPage < totalPages && (
                <PaginationItem>
                  <PaginationLink onClick={() => setCurrentPage(currentPage + 1)}>{currentPage + 1}</PaginationLink>
                </PaginationItem>
              )}

              {/* Show ellipsis if needed */}
              {currentPage < totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {/* Show last page if not visible */}
              {currentPage < totalPages - 1 && (
                <PaginationItem>
                  <PaginationLink onClick={() => setCurrentPage(totalPages)}>{totalPages}</PaginationLink>
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => currentPage < totalPages && setCurrentPage((prev) => prev + 1)}
                  aria-disabled={currentPage === totalPages}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

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

