"use client"

import { useState, useEffect, useMemo } from "react"
import {
  ExternalLink,
  CalendarIcon,
  TagIcon,
  ComponentIcon as ChipIcon,
  XIcon,
  Pencil,
  Trash,
  MessageSquare,
  Search,
  Filter,
  ArrowUpDown,
  Clock,
  BookOpen,
  Calendar,
  Github,
  Globe,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { ArticleType, UserType, LabelType, TechnologieType } from "@/types"
import type { ArticleCommentType } from "@/types"

import ReactMarkdown from "react-markdown"
import Image from "next/image"
import Loading from "@/components/Loading"
import { useResponsiveSize } from "@/hooks/useResponsiveSize"

// 並び替え方法の型
type SortOptionType = "titleAsc" | "titleDesc" | "dateAsc" | "dateDesc"

// コメント編集用のメソッドを PATCH にする想定
const COMMENT_UPDATE_METHOD = "PATCH"

export default function ArticleList() {
  const [articles, setArticles] = useState<ArticleType[]>([])
  const [users, setUsers] = useState<{ [key: string]: UserType }>({})
  const [selectedArticle, setSelectedArticle] = useState<ArticleType | null>(null)
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [labels, setLabels] = useState<{ [key: number]: LabelType }>({})
  const [technologies, setTechnologies] = useState<{ [key: number]: TechnologieType }>({})

  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)

  // Comment management states
  const [comments, setComments] = useState<ArticleCommentType[]>([])
  const [commentLoading, setCommentLoading] = useState(false)
  const [selectedArticleForComment, setSelectedArticleForComment] = useState<ArticleType | null>(null)
  const [newComment, setNewComment] = useState("")
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editingCommentContent, setEditingCommentContent] = useState("")
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // Filtering and sorting states
  const [searchKeyword, setSearchKeyword] = useState("")
  const [selectedLabelIds, setSelectedLabelIds] = useState<number[]>([])
  const [selectedTechnologyIds, setSelectedTechnologyIds] = useState<number[]>([])
  const [sortOption, setSortOption] = useState<SortOptionType>("dateDesc")
  const [activeTab, setActiveTab] = useState("all")

  const size = useResponsiveSize()

  // Role badge component
  const RoleBadge = ({ role }: { role: string | null }) => {
    const badgeStyles = {
      admin: "bg-red-100 text-red-800 hover:bg-red-100 border-red-200",
      manager: "bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200",
      member: "bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200",
      general: "bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200",
    }
    const style = badgeStyles[role as keyof typeof badgeStyles] || badgeStyles.general

    return (
      <Badge variant="outline" className={`font-medium ${style}`}>
        {role}
      </Badge>
    )
  }

  // Check if user is logged in
  useEffect(() => {
    const checkUserExists = async () => {
      try {
        const res = await fetch("/api/user/check")
        const data = await res.json()
        if (data.exists) {
          setUserRole(data.userRole)
          setCurrentUserId(data.userId)
        }
      } catch (error) {
        console.error("Failed to check user existence:", error)
      }
    }
    checkUserExists()
  }, [])

  // Fetch article data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const articlesRes = await fetch("/api/articles")
        const articlesData: ArticleType[] = await articlesRes.json()

        // Filter articles based on visibility settings
        const filteredArticles = articlesData.filter((article) => {
          if (article.type === "Preview") return false
          if (article.type === "Public") return true
          if (article.type === "Private") {
            return !(userRole === null || userRole === "general")
          }
          return false
        })

        setArticles(filteredArticles)

        // Fetch related data
        const authorIds = Array.from(new Set(articlesData.flatMap((a) => a.authorIds)))
        if (authorIds.length > 0) {
          const usersRes = await fetch(`/api/user?ids=${authorIds.join(",")}`)
          const usersData: UserType[] = await usersRes.json()
          setUsers(Object.fromEntries(usersData.map((u) => [u.id, u])))
        }

        const labelIds = Array.from(new Set(articlesData.flatMap((a) => a.labelIds)))
        if (labelIds.length > 0) {
          const labelsRes = await fetch(`/api/labels?ids=${labelIds.join(",")}`)
          const labelsData: LabelType[] = await labelsRes.json()
          setLabels(Object.fromEntries(labelsData.map((l) => [l.id, l])))
        }

        const technologieIds = Array.from(new Set(articlesData.flatMap((a) => a.technologieIds)))
        if (technologieIds.length > 0) {
          const technologiesRes = await fetch(`/api/technologies?ids=${technologieIds.join(",")}`)
          const technologiesData: TechnologieType[] = await technologiesRes.json()
          setTechnologies(Object.fromEntries(technologiesData.map((t) => [t.id, t])))
        }

        setLoading(false)
      } catch (error) {
        console.error("Failed to fetch data", error)
      }
    }
    fetchData()
  }, [userRole])

  // Load comments for an article
  const loadComments = async (articleId: number) => {
    setCommentLoading(true)
    try {
      const res = await fetch(`/api/articles/comments?articleId=${articleId}`)
      const data = (await res.json()) as ArticleCommentType[]
      setComments(data)
    } catch (error) {
      console.error("Failed to fetch comments:", error)
    } finally {
      setCommentLoading(false)
    }
  }

  // Open article detail and load comments
  const openArticleDetail = async (article: ArticleType) => {
    setSelectedArticle(article)
    setEditingCommentId(null)
    setEditingCommentContent("")
    await loadComments(article.id)
  }

  // Open comment modal
  const handleOpenCommentModal = (article: ArticleType) => {
    setSelectedArticleForComment(article)
    setNewComment("")
  }

  // Submit new comment
  const handleSubmitNewComment = async () => {
    if (!selectedArticleForComment || !newComment.trim()) return
    try {
      await fetch("/api/articles/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId: selectedArticleForComment.id,
          userId: currentUserId,
          content: newComment.trim(),
        }),
      })

      // Reload comments if the article detail dialog is open
      if (selectedArticle && selectedArticle.id === selectedArticleForComment.id) {
        loadComments(selectedArticle.id)
      }

      setNewComment("")
      setSelectedArticleForComment(null)
    } catch (error) {
      console.error("Failed to post comment:", error)
    }
  }

  // Delete comment
  const handleDeleteComment = async (commentId: number) => {
    try {
      await fetch(`/api/articles/comments/${commentId}`, { method: "DELETE" })
      if (selectedArticle) {
        loadComments(selectedArticle.id)
      }
    } catch (error) {
      console.error("Failed to delete comment:", error)
    }
  }

  // Start editing comment
  const handleStartEditing = (comment: ArticleCommentType) => {
    setEditingCommentId(comment.id)
    setEditingCommentContent(comment.content)
  }

  // Update comment
  const handleUpdateComment = async () => {
    if (!editingCommentId || !editingCommentContent.trim()) {
      setEditingCommentId(null)
      return
    }
    try {
      await fetch(`/api/articles/comments/${editingCommentId}`, {
        method: COMMENT_UPDATE_METHOD,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editingCommentContent.trim() }),
      })
      if (selectedArticle) {
        loadComments(selectedArticle.id)
      }
      setEditingCommentId(null)
      setEditingCommentContent("")
    } catch (error) {
      console.error("Failed to update comment:", error)
    }
  }

  // Toggle label selection
  const toggleLabel = (labelId: number) => {
    setSelectedLabelIds((prev) => (prev.includes(labelId) ? prev.filter((id) => id !== labelId) : [...prev, labelId]))
  }

  // Toggle technology selection
  const toggleTechnology = (techId: number) => {
    setSelectedTechnologyIds((prev) => (prev.includes(techId) ? prev.filter((id) => id !== techId) : [...prev, techId]))
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  // Filter and sort articles
  const filteredAndSortedArticles = useMemo(() => {
    let result = [...articles]

    // Filter by tab
    if (activeTab === "recent") {
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
      result = result.filter((article) => new Date(article.date) >= oneMonthAgo)
    }

    // Filter by search keyword
    if (searchKeyword.trim() !== "") {
      const lowerKeyword = searchKeyword.toLowerCase()
      result = result.filter((article) => {
        const titleMatch = article.title.toLowerCase().includes(lowerKeyword)
        const authorsMatch = (article.authorIds ?? []).some((authorId) => {
          const author = users[authorId]
          if (!author) return false
          return author.name.toLowerCase().includes(lowerKeyword)
        })
        return titleMatch || authorsMatch
      })
    }

    // Filter by labels
    if (selectedLabelIds.length > 0) {
      result = result.filter((article) => {
        const articleLabels = article.labelIds ?? []
        return selectedLabelIds.every((id) => articleLabels.includes(id))
      })
    }

    // Filter by technologies
    if (selectedTechnologyIds.length > 0) {
      result = result.filter((article) => {
        const articleTechs = article.technologieIds ?? []
        return selectedTechnologyIds.every((id) => articleTechs.includes(id))
      })
    }

    // Sort
    result.sort((a, b) => {
      switch (sortOption) {
        case "titleAsc":
          return a.title.localeCompare(b.title)
        case "titleDesc":
          return b.title.localeCompare(a.title)
        case "dateAsc":
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case "dateDesc":
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        default:
          return 0
      }
    })
    return result
  }, [articles, searchKeyword, selectedLabelIds, selectedTechnologyIds, sortOption, users, activeTab])

  // Get all labels and technologies
  const allLabelList = Object.values(labels)
  const allTechnologyList = Object.values(technologies)

  if (loading) {
    return (
      <div className="w-full h-screen flex items-start justify-center pt-32">
        <Loading size={size} />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">記事一覧</h1>
        <p className="text-muted-foreground">
          登録されている記事の一覧です。フィルターやソート機能を使って探すことができます。
        </p>
      </div>

      <Tabs defaultValue="all" className="mb-8" onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="all">すべての記事</TabsTrigger>
            <TabsTrigger value="recent">最近の記事</TabsTrigger>
          </TabsList>

          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="記事タイトルまたは作者名で検索"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-9 w-full sm:w-[250px]"
              />
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <Filter className="h-4 w-4" />
                  <span className="sr-only">フィルター</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">カテゴリで絞り込み</h3>
                    <div className="max-h-[200px] overflow-y-auto">
                      <div className="grid grid-cols-1 gap-2">
                        {allLabelList.map((labelObj) => (
                          <div key={labelObj.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`label-${labelObj.id}`}
                              checked={selectedLabelIds.includes(labelObj.id)}
                              onCheckedChange={() => toggleLabel(labelObj.id)}
                            />
                            <label
                              htmlFor={`label-${labelObj.id}`}
                              className="text-sm font-medium leading-none cursor-pointer"
                            >
                              {labelObj.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-medium mb-2">使用技術で絞り込み</h3>
                    <div className="max-h-[200px] overflow-y-auto">
                      <div className="grid grid-cols-1 gap-2">
                        {allTechnologyList.map((tech) => (
                          <div key={tech.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`tech-${tech.id}`}
                              checked={selectedTechnologyIds.includes(tech.id)}
                              onCheckedChange={() => toggleTechnology(tech.id)}
                            />
                            <label
                              htmlFor={`tech-${tech.id}`}
                              className="text-sm font-medium leading-none cursor-pointer"
                            >
                              {tech.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {(selectedLabelIds.length > 0 || selectedTechnologyIds.length > 0) && (
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-sm text-muted-foreground">
                        {selectedLabelIds.length + selectedTechnologyIds.length}件選択中
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedLabelIds([])
                          setSelectedTechnologyIds([])
                        }}
                        className="h-8 text-xs"
                      >
                        クリア
                      </Button>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <ArrowUpDown className="h-4 w-4" />
                  <span className="sr-only">並び替え</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56">
                <div className="space-y-2">
                  <h3 className="font-medium">並び替え</h3>
                  <Separator />
                  <RadioGroup value={sortOption} onValueChange={(value) => setSortOption(value as SortOptionType)}>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="titleAsc" id="sort-title-asc" />
                        <Label htmlFor="sort-title-asc">タイトル(昇順)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="titleDesc" id="sort-title-desc" />
                        <Label htmlFor="sort-title-desc">タイトル(降順)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="dateAsc" id="sort-date-asc" />
                        <Label htmlFor="sort-date-asc">作成日時(古い順)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="dateDesc" id="sort-date-desc" />
                        <Label htmlFor="sort-date-desc">作成日時(新しい順)</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Selected filters display */}
        {(selectedLabelIds.length > 0 || selectedTechnologyIds.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedLabelIds.map(
              (labelId) =>
                labels[labelId] && (
                  <Badge
                    key={`selected-label-${labelId}`}
                    variant="secondary"
                    className="pl-2 flex items-center gap-1 bg-green-50 text-green-700 hover:bg-green-100"
                  >
                    <TagIcon className="h-3 w-3" />
                    {labels[labelId].name}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleLabel(labelId)}
                      className="h-5 w-5 p-0 ml-1 hover:bg-green-200 rounded-full"
                    >
                      <XIcon className="h-3 w-3" />
                      <span className="sr-only">削除</span>
                    </Button>
                  </Badge>
                ),
            )}
            {selectedTechnologyIds.map(
              (techId) =>
                technologies[techId] && (
                  <Badge
                    key={`selected-tech-${techId}`}
                    variant="secondary"
                    className="pl-2 flex items-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100"
                  >
                    <ChipIcon className="h-3 w-3" />
                    {technologies[techId].name}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleTechnology(techId)}
                      className="h-5 w-5 p-0 ml-1 hover:bg-blue-200 rounded-full"
                    >
                      <XIcon className="h-3 w-3" />
                      <span className="sr-only">削除</span>
                    </Button>
                  </Badge>
                ),
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedLabelIds([])
                setSelectedTechnologyIds([])
                setSearchKeyword("")
              }}
              className="text-xs"
            >
              <XIcon className="h-3 w-3 mr-1" />
              フィルターをリセット
            </Button>
          </div>
        )}

        <TabsContent value="all" className="mt-0">
          {filteredAndSortedArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  users={users}
                  labels={labels}
                  technologies={technologies}
                  openArticleDetail={openArticleDetail}
                  handleOpenCommentModal={handleOpenCommentModal}
                  currentUserId={currentUserId}
                  formatDate={formatDate}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Filter className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">記事が見つかりません</h3>
              <p className="text-muted-foreground mt-2">
                検索条件に一致する記事がありません。フィルターをリセットしてみてください。
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent" className="mt-0">
          {filteredAndSortedArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  users={users}
                  labels={labels}
                  technologies={technologies}
                  openArticleDetail={openArticleDetail}
                  handleOpenCommentModal={handleOpenCommentModal}
                  currentUserId={currentUserId}
                  formatDate={formatDate}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Calendar className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">最近の記事がありません</h3>
              <p className="text-muted-foreground mt-2">過去1ヶ月以内に追加された記事がありません。</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Article detail dialog */}
      {selectedArticle && (
        <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{selectedArticle.title}</DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                {formatDate(selectedArticle.date)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {/* Authors */}
              <div className="flex flex-wrap gap-2">
                {(selectedArticle.authorIds ?? []).map((authorId) => {
                  const author = users[authorId]
                  if (!author) return null
                  return (
                    <Button
                      key={authorId}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 hover:bg-muted"
                      onClick={() => setSelectedUser(author)}
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={author.icon || "/images/default-avatar.jpeg"} alt={author.name} />
                        <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{author.name}</span>
                    </Button>
                  )
                })}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {(selectedArticle.labelIds ?? []).map((labelId) => (
                  <Badge
                    key={labelId}
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                  >
                    <TagIcon className="h-3 w-3 mr-1" />
                    {labels[labelId]?.name}
                  </Badge>
                ))}
                {(selectedArticle.technologieIds ?? []).map((techId) => (
                  <Badge
                    key={techId}
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                  >
                    <ChipIcon className="h-3 w-3 mr-1" />
                    {technologies[techId]?.name}
                  </Badge>
                ))}
              </div>

              {/* Content */}
              <div className="prose dark:prose-invert max-w-none border-t border-b py-6">
                <ReactMarkdown
                  components={{
                    img: ({ ...props }) => (
                      <div className="flex justify-center my-4">
                        <img {...props} className="max-w-full h-auto rounded-md" />
                      </div>
                    ),
                    h1: ({ ...props }) => <h1 {...props} className="text-2xl font-bold mt-6 mb-4" />,
                    h2: ({ ...props }) => <h2 {...props} className="text-xl font-bold mt-5 mb-3" />,
                    h3: ({ ...props }) => <h3 {...props} className="text-lg font-bold mt-4 mb-2" />,
                    p: ({ ...props }) => <p {...props} className="my-3 leading-relaxed" />,
                    a: ({ ...props }) => <a {...props} className="text-blue-600 hover:underline" />,
                    code: ({ ...props }) => <code {...props} className="bg-gray-100 rounded px-1 py-0.5 text-sm" />,
                    pre: ({ ...props }) => <pre {...props} className="bg-gray-100 rounded p-3 overflow-x-auto my-4" />,
                  }}
                >
                  {selectedArticle.content}
                </ReactMarkdown>
              </div>

              {/* Comments */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  コメント ({comments.length})
                </h3>

                {commentLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.length > 0 ? (
                      comments.map((comment) => {
                        const commentUser = users[comment.userId]
                        const isAuthor = comment.userId === currentUserId

                        // Editing mode
                        if (editingCommentId === comment.id) {
                          return (
                            <div key={comment.id} className="p-4 border rounded-lg bg-muted/30">
                              <div className="mb-2 flex gap-2 items-center">
                                {commentUser ? (
                                  <Avatar>
                                    <AvatarImage
                                      src={commentUser.icon || "/images/default-avatar.jpeg"}
                                      alt={commentUser.name}
                                    />
                                    <AvatarFallback>{commentUser.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                ) : (
                                  <Avatar>
                                    <AvatarFallback>?</AvatarFallback>
                                  </Avatar>
                                )}
                                <span className="text-sm font-bold">{commentUser?.name ?? "名無し"}</span>
                                <span className="text-xs text-muted-foreground ml-auto">
                                  {new Date(comment.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <Textarea
                                className="w-full min-h-[100px]"
                                value={editingCommentContent}
                                onChange={(e) => setEditingCommentContent(e.target.value)}
                              />
                              <div className="flex justify-end gap-2 mt-2">
                                <Button size="sm" onClick={handleUpdateComment}>
                                  保存
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingCommentId(null)
                                    setEditingCommentContent("")
                                  }}
                                >
                                  キャンセル
                                </Button>
                              </div>
                            </div>
                          )
                        }

                        // Normal display
                        return (
                          <div key={comment.id} className="p-4 border rounded-lg">
                            <div className="flex gap-2 items-center">
                              {commentUser ? (
                                <Avatar>
                                  <AvatarImage
                                    src={commentUser.icon || "/images/default-avatar.jpeg"}
                                    alt={commentUser.name}
                                  />
                                  <AvatarFallback>{commentUser.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                              ) : (
                                <Avatar>
                                  <AvatarFallback>?</AvatarFallback>
                                </Avatar>
                              )}
                              <div>
                                <span className="text-sm font-bold">{commentUser?.name ?? "名無し"}</span>
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {new Date(comment.createdAt).toLocaleString()}
                                </div>
                              </div>
                            </div>
                            <p className="mt-2 whitespace-pre-wrap">{comment.content}</p>
                            {isAuthor && (
                              <div className="flex gap-2 justify-end mt-2">
                                <Button variant="ghost" size="sm" onClick={() => handleStartEditing(comment)}>
                                  <Pencil className="w-4 h-4 mr-1" />
                                  編集
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteComment(comment.id)}>
                                  <Trash className="w-4 h-4 mr-1" />
                                  削除
                                </Button>
                              </div>
                            )}
                          </div>
                        )
                      })
                    ) : (
                      <div className="text-center py-8 bg-muted/30 rounded-lg">
                        <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">まだコメントはありません</p>
                        {currentUserId && (
                          <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => handleOpenCommentModal(selectedArticle)}
                          >
                            コメントを書く
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="mt-6 flex-col sm:flex-row gap-2">
              {currentUserId && (
                <Button
                  variant="outline"
                  onClick={() => handleOpenCommentModal(selectedArticle)}
                  className="w-full sm:w-auto sm:mr-auto"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  コメントを書く
                </Button>
              )}
            </DialogFooter>
            <div className="sticky bottom-0 z-10 p-4 flex justify-end">
                <Button onClick={() => setSelectedArticle(null)} className="flex items-center gap-2">
                  <XIcon className="h-4 w-4" />
                  閉じる
                </Button>
              </div>
          </DialogContent>
        </Dialog>
      )}

      {/* User detail dialog */}
      {selectedUser && (
        <Dialog open={true} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader className="space-y-2">
              <div className="flex items-center space-x-2">
                <DialogTitle className="text-xl font-semibold">{selectedUser.name}</DialogTitle>
                <RoleBadge role={selectedUser.type} />
              </div>
              <DialogDescription className="text-sm text-muted-foreground">ユーザー情報の詳細</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.icon || "/images/default-avatar.jpeg"} alt={selectedUser.name} />
                  <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{selectedUser.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedUser.type || "一般ユーザー"}</p>
                </div>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="whitespace-pre-wrap">{selectedUser.bio || "自己紹介はありません"}</p>
              </div>

              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                {selectedUser.githubUrl && (
                  <Button className="gap-2 group w-full" size="lg">
                    <a
                      href={selectedUser.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-full gap-2"
                    >
                      <Github className="w-4 h-4" />
                      GitHub プロフィール
                      <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  </Button>
                )}
                {selectedUser.portfolioUrl && (
                  <Button variant="outline" className="gap-2 group w-full" size="lg">
                    <a
                      href={selectedUser.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-full gap-2"
                    >
                      <Globe className="w-4 h-4" />
                      ポートフォリオサイト
                      <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* New comment dialog */}
      {selectedArticleForComment && (
        <Dialog open={true} onOpenChange={() => setSelectedArticleForComment(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>コメントを書く</DialogTitle>
              <DialogDescription>{selectedArticleForComment.title} にコメントを投稿します</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Textarea
                className="min-h-[150px]"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="コメントを入力..."
              />
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedArticleForComment(null)}
                  className="w-full sm:w-auto"
                >
                  キャンセル
                </Button>
                <Button onClick={handleSubmitNewComment} disabled={!newComment.trim()} className="w-full sm:w-auto">
                  投稿する
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Article card component
function ArticleCard({
  article,
  users,
  labels,
  technologies,
  openArticleDetail,
  handleOpenCommentModal,
  currentUserId,
  formatDate,
}: {
  article: ArticleType
  users: { [key: string]: UserType }
  labels: { [key: number]: LabelType }
  technologies: { [key: number]: TechnologieType }
  openArticleDetail: (article: ArticleType) => void
  handleOpenCommentModal: (article: ArticleType) => void
  currentUserId: string | null
  formatDate: (date: string) => string
}) {
  const authorIds = article.authorIds ?? []
  const firstAuthorId = authorIds[0]
  const firstAuthor = firstAuthorId ? users[firstAuthorId] : null
  const othersCount = authorIds.length - 1

  // Extract first image from content if available
  const getFirstImage = () => {
    const imgRegex = /!\[.*?\]$$(.*?)$$/
    const match = article.content.match(imgRegex)
    return match ? match[1] : null
  }

  const firstImage = getFirstImage()

  // Get excerpt from content (strip markdown)
  const getExcerpt = (content: string, length = 120) => {
    // Remove markdown formatting
    const plainText = content
      .replace(/!\[.*?\]$$.*?$$/g, "") // Remove images
      .replace(/\[([^\]]+)\]$$([^)]+)$$/g, "$1") // Replace links with just text
      .replace(/[*_~`#]/g, "") // Remove formatting characters
      .replace(/\n+/g, " ") // Replace newlines with spaces
      .trim()

    return plainText.length > length ? plainText.substring(0, length) + "..." : plainText
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md flex flex-col">
      {firstImage && (
        <div className="relative h-40 overflow-hidden">
          <Image
            src={firstImage || "/placeholder.svg"}
            alt={article.title}
            className="w-full h-full object-cover transition-transform hover:scale-105"
            width={400}
            height={160}
          />
        </div>
      )}
      <CardHeader className={`${firstImage ? "pb-2" : "pt-4 pb-2"}`}>
        <CardTitle
          className="line-clamp-2 text-lg font-bold hover:text-blue-600 cursor-pointer"
          onClick={() => openArticleDetail(article)}
        >
          {article.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pb-2 flex-grow">
        <div className="flex flex-wrap gap-1">
          {(article.labelIds ?? []).slice(0, 2).map((labelId) => (
            <Badge
              key={labelId}
              variant="outline"
              className="text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100 inline-flex items-center gap-1"
            >
              <TagIcon className="h-3 w-3" />
              {labels[labelId]?.name}
            </Badge>
          ))}
          {(article.technologieIds ?? []).slice(0, 2).map((technologieId) => (
            <Badge
              key={technologieId}
              variant="outline"
              className="text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 inline-flex items-center gap-1"
            >
              <ChipIcon className="h-3 w-3" />
              {technologies[technologieId]?.name}
            </Badge>
          ))}
          {(article.labelIds?.length || 0) + (article.technologieIds?.length || 0) > 4 && (
            <Badge variant="outline" className="text-xs">
              +{(article.labelIds?.length || 0) + (article.technologieIds?.length || 0) - 4}
            </Badge>
          )}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-3">{getExcerpt(article.content)}</p>

        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5 mr-1" />
          {formatDate(article.date)}
        </div>
      </CardContent>
      <CardFooter className="pt-0 mt-auto">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            {firstAuthor && (
              <>
                <Avatar className="h-6 w-6">
                  <AvatarImage src={firstAuthor.icon || "/images/default-avatar.jpeg"} alt={firstAuthor.name} />
                  <AvatarFallback>{firstAuthor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm truncate max-w-[100px]">{firstAuthor.name}</span>
                {othersCount > 0 && <span className="text-xs text-muted-foreground">+{othersCount}</span>}
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => openArticleDetail(article)}
              size="sm"
              variant="ghost"
              className="flex items-center gap-1"
            >
              <BookOpen className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only sm:inline">読む</span>
            </Button>
            {currentUserId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenCommentModal(article)}
                className="flex items-center gap-1"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:inline">コメント</span>
              </Button>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
