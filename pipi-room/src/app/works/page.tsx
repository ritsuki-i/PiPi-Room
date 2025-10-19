"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button"
import Loading from "@/components/Loading"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import type { WorkType, UserType, LabelType, TechnologieType } from "../../types"
import type { WorkCommentType } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import {
  ExternalLink,
  User,
  TagIcon,
  ComponentIcon as ChipIcon,
  XIcon,
  Pencil,
  Trash,
  Search,
  MessageSquare,
  Filter,
  ArrowUpDown,
  Calendar,
  Github,
  Globe,
  Clock,
} from "lucide-react"
import { useResponsiveSize } from "@/hooks/useResponsiveSize"

type SortOptionType = "nameAsc" | "nameDesc" | "dateAsc" | "dateDesc"

export default function WorkList() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialLabelIds = searchParams.get('labels')?.split(',').map(Number).filter(id => !isNaN(id)) || [];
  const initialTechIds = searchParams.get('techs')?.split(',').map(Number).filter(id => !isNaN(id)) || [];
  const initialSort = searchParams.get('sort') as SortOptionType || 'dateDesc';
  const initialSearch = searchParams.get('q') || '';
  const initialTab = searchParams.get('tab') || 'all';

  const [works, setWorks] = useState<WorkType[]>([])
  const [users, setUsers] = useState<{ [key: string]: UserType }>({})
  const [labels, setLabels] = useState<{ [key: number]: LabelType }>({})
  const [technologies, setTechnologies] = useState<{ [key: number]: TechnologieType }>({})

  const [selectedWork, setSelectedWork] = useState<WorkType | null>(null)
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)

  // Comment management states
  const [comments, setComments] = useState<WorkCommentType[]>([])
  const [commentLoading, setCommentLoading] = useState(false)
  const [selectedWorkForComment, setSelectedWorkForComment] = useState<WorkType | null>(null)
  const [newComment, setNewComment] = useState("")
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editingCommentContent, setEditingCommentContent] = useState("")
  const [currentUserId, setCurrentUserId] = useState<string | null>("") // Example

  // Filtering and sorting states(初期値で更新)
  const [selectedLabelIds, setSelectedLabelIds] = useState<number[]>(initialLabelIds);
  const [selectedTechnologyIds, setSelectedTechnologyIds] = useState<number[]>(initialTechIds);
  const [sortOption, setSortOption] = useState<SortOptionType>(initialSort);
  const [searchKeyword, setSearchKeyword] = useState(initialSearch);
  const [activeTab, setActiveTab] = useState(initialTab);

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

  // Fetch data after user role is determined
  useEffect(() => {
    const fetchData = async () => {
      try {
        const worksRes = await fetch("/api/works")
        const worksData: WorkType[] = await worksRes.json()

        // Filter works based on visibility settings
        const filteredWorks = worksData.filter((work) => {
          if (work.type === "Preview") return false
          if (work.type === "Public") return true
          if (work.type === "Private") {
            return !(userRole === null || userRole === "general")
          }
          return false
        })

        setWorks(filteredWorks)

        // Fetch related data
        const authorIds = Array.from(new Set(filteredWorks.flatMap((w) => w.authorIds)))
        if (authorIds.length > 0) {
          const usersRes = await fetch(`/api/user?ids=${authorIds.join(",")}`)
          const usersData: UserType[] = await usersRes.json()
          setUsers(Object.fromEntries(usersData.map((u) => [u.id, u])))
        }

        const labelIds = Array.from(new Set(filteredWorks.flatMap((w) => w.labelIds)))
        if (labelIds.length > 0) {
          const labelsRes = await fetch(`/api/labels?ids=${labelIds.join(",")}`)
          const labelsData: LabelType[] = await labelsRes.json()
          setLabels(Object.fromEntries(labelsData.map((l) => [l.id, l])))
        }

        const technologieIds = Array.from(new Set(filteredWorks.flatMap((w) => w.technologieIds)))
        if (technologieIds.length > 0) {
          const technologiesRes = await fetch(`/api/technologies?ids=${technologieIds.join(",")}`)
          const technologiesData: TechnologieType[] = await technologiesRes.json()
          setTechnologies(Object.fromEntries(technologiesData.map((t) => [t.id, t])))
        }
      } catch (error) {
        console.error("Failed to fetch data", error)
      } finally {
        setLoading(false)
      }
    }

    if (userRole !== undefined) {
      fetchData()
    }
  }, [userRole])

  // フィルター状態が変更されたらURLを更新するuseEffect
  useEffect(() => {
    const params = new URLSearchParams();

    if (selectedLabelIds.length > 0) {
      params.set('labels', selectedLabelIds.join(','));
    }
    if (selectedTechnologyIds.length > 0) {
      params.set('techs', selectedTechnologyIds.join(','));
    }
    if (sortOption !== 'dateDesc') { // デフォルト値以外ならセット
      params.set('sort', sortOption);
    }
    if (searchKeyword) {
      params.set('q', searchKeyword);
    }
     if (activeTab !== 'all') { // デフォルト値以外ならセット
      params.set('tab', activeTab);
    }

    // クエリパラメータ文字列を生成 (?を含まない)
    const queryString = params.toString();

    // router.replaceでURLを更新 (履歴に残さない)
    // 現在のパス (`/works`) + 新しいクエリ文字列
    router.replace(`/works${queryString ? `?${queryString}` : ''}`, { scroll: false });

  }, [selectedLabelIds, selectedTechnologyIds, sortOption, searchKeyword, activeTab, router]);

  // Toggle label selection
  const toggleLabel = (labelId: number) => {
    setSelectedLabelIds((prev) => (prev.includes(labelId) ? prev.filter((id) => id !== labelId) : [...prev, labelId]))
  }

  // Toggle technology selection
  const toggleTechnology = (techId: number) => {
    setSelectedTechnologyIds((prev) => (prev.includes(techId) ? prev.filter((id) => id !== techId) : [...prev, techId]))
  }

  // Filter and sort works
  const filteredAndSortedWorks = useMemo(() => {
    let result = [...works]

    // Filter by tab
    if (activeTab === "recent") {
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
      result = result.filter((work) => new Date(work.date) >= oneMonthAgo)
    }

    // Filter by search keyword
    if (searchKeyword.trim() !== "") {
      const lowerKeyword = searchKeyword.toLowerCase()
      result = result.filter((work) => {
        const nameMatch = work.name.toLowerCase().includes(lowerKeyword)
        const authorsMatch = (work.authorIds ?? []).some((authorId) => {
          const author = users[authorId]
          if (!author) return false
          return author.name.toLowerCase().includes(lowerKeyword)
        })
        return nameMatch || authorsMatch
      })
    }

    // Filter by labels
    if (selectedLabelIds.length > 0) {
      result = result.filter((work) => {
        const workLabelIds = work.labelIds ?? []
        return selectedLabelIds.every((id) => workLabelIds.includes(id))
      })
    }

    // Filter by technologies
    if (selectedTechnologyIds.length > 0) {
      result = result.filter((work) => {
        const workTechIds = work.technologieIds ?? []
        return selectedTechnologyIds.every((id) => workTechIds.includes(id))
      })
    }

    // Sort
    result.sort((a, b) => {
      switch (sortOption) {
        case "nameAsc":
          return a.name.localeCompare(b.name)
        case "nameDesc":
          return b.name.localeCompare(a.name)
        case "dateAsc":
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case "dateDesc":
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        default:
          return 0
      }
    })

    return result
  }, [works, searchKeyword, selectedLabelIds, selectedTechnologyIds, sortOption, users, activeTab])

  // Open work detail and load comments
  const openWorkDetail = async (work: WorkType) => {
    setSelectedWork(work)
    setEditingCommentId(null)
    setEditingCommentContent("")
    await loadComments(work.id)
  }

  // Load comments for a work
  const loadComments = async (workId: number) => {
    setCommentLoading(true)
    try {
      const res = await fetch(`/api/works/comments?workId=${workId}`)
      const data = (await res.json()) as WorkCommentType[]
      setComments(data)
    } catch (error) {
      console.error("Failed to fetch comments:", error)
    } finally {
      setCommentLoading(false)
    }
  }

  // Open comment modal
  const handleOpenCommentModal = (work: WorkType) => {
    setSelectedWorkForComment(work)
    setNewComment("")
  }

  // Submit new comment
  const handleSubmitNewComment = async () => {
    if (!selectedWorkForComment || !newComment.trim()) return
    try {
      await fetch("/api/works/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workId: selectedWorkForComment.id,
          userId: currentUserId,
          content: newComment.trim(),
        }),
      })

      // Reload comments if the work detail dialog is open
      if (selectedWork && selectedWork.id === selectedWorkForComment.id) {
        loadComments(selectedWork.id)
      }

      setNewComment("")
      setSelectedWorkForComment(null)
    } catch (error) {
      console.error("Failed to post comment:", error)
    }
  }

  // Delete comment
  const handleDeleteComment = async (commentId: number) => {
    try {
      await fetch(`/api/works/comments/${commentId}`, {
        method: "DELETE",
      })
      if (selectedWork) {
        loadComments(selectedWork.id)
      }
    } catch (error) {
      console.error("Failed to delete comment:", error)
    }
  }

  // Start editing comment
  const handleStartEditing = (comment: WorkCommentType) => {
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
      await fetch(`/api/works/comments/${editingCommentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editingCommentContent.trim() }),
      });
      if (selectedWork) {
        loadComments(selectedWork.id)
      }
      setEditingCommentId(null)
      setEditingCommentContent("")
    } catch (error) {
      console.error("Failed to update comment:", error)
    }
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

  if (loading) {
    return (
      <div className="w-full h-screen flex items-start justify-center pt-32">
        <Loading size={size} />
      </div>
    )
  }

  // Get all labels and technologies
  const allLabelList = Object.values(labels)
  const allTechnologyList = Object.values(technologies)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">作品一覧</h1>
        <p className="text-muted-foreground">
          登録されている作品の一覧です。フィルターやソート機能を使って探すことができます。
        </p>
      </div>

      <Tabs defaultValue="all" className="mb-8" onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="all">すべての作品</TabsTrigger>
            <TabsTrigger value="recent">最近の作品</TabsTrigger>
          </TabsList>

          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="作品名または作者名で検索"
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
                        <RadioGroupItem value="nameAsc" id="sort-name-asc" />
                        <Label htmlFor="sort-name-asc">作品名(昇順)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="nameDesc" id="sort-name-desc" />
                        <Label htmlFor="sort-name-desc">作品名(降順)</Label>
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
          {filteredAndSortedWorks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedWorks.map((work) => (
                <WorkCard
                  key={work.id}
                  work={work}
                  users={users}
                  labels={labels}
                  technologies={technologies}
                  openWorkDetail={openWorkDetail}
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
              <h3 className="text-lg font-medium">作品が見つかりません</h3>
              <p className="text-muted-foreground mt-2">
                検索条件に一致する作品がありません。フィルターをリセットしてみてください。
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent" className="mt-0">
          {filteredAndSortedWorks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedWorks.map((work) => (
                <WorkCard
                  key={work.id}
                  work={work}
                  users={users}
                  labels={labels}
                  technologies={technologies}
                  openWorkDetail={openWorkDetail}
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
              <h3 className="text-lg font-medium">最近の作品がありません</h3>
              <p className="text-muted-foreground mt-2">過去1ヶ月以内に追加された作品がありません。</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Work detail dialog */}
      {selectedWork && (
        <Dialog open={!!selectedWork} onOpenChange={() => setSelectedWork(null)}>
          <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{selectedWork.name}</DialogTitle>
              <DialogDescription>作成日: {formatDate(selectedWork.date)}</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-2">
              {/* Image */}
              <div className="relative rounded-lg overflow-hidden border border-muted">
                <Image
                  src={selectedWork.icon || "/images/noimg.png"}
                  alt={selectedWork.name}
                  className="w-full h-[300px] object-cover"
                  width={650}
                  height={300}
                />
              </div>

              {/* Description */}
              <div className="prose prose-sm max-w-none">
                <h3 className="text-lg font-medium mb-2">概要</h3>
                <p className="text-muted-foreground">{selectedWork.description || "説明はありません"}</p>
              </div>

              {/* Tags section */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">タグ</h3>
                <div className="flex flex-wrap gap-2">
                  {(selectedWork.labelIds ?? []).map((labelId) => (
                    <Badge
                      key={labelId}
                      variant="outline"
                      className="text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100 inline-flex items-center gap-1"
                    >
                      <TagIcon className="h-3 w-3" />
                      {labels[labelId]?.name}
                    </Badge>
                  ))}
                  {(selectedWork.technologieIds ?? []).map((technologieId) => (
                    <Badge
                      key={technologieId}
                      variant="outline"
                      className="text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 inline-flex items-center gap-1"
                    >
                      <ChipIcon className="h-3 w-3" />
                      {technologies[technologieId]?.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Authors */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">作成者</h3>
                <div className="flex flex-wrap gap-3">
                  <TooltipProvider>
                    {(selectedWork.authorIds ?? []).map((authorId) => {
                      if (!users[authorId]) return null
                      return (
                        <Tooltip key={authorId}>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2 hover:bg-muted transition-colors cursor-pointer group"
                              onClick={() => setSelectedUser(users[authorId])}
                            >
                              <div className="relative w-6 h-6 rounded-full overflow-hidden border border-muted">
                                <Image
                                  src={users[authorId].icon || "/images/default-avatar.jpeg" || "/placeholder.svg"}
                                  alt={users[authorId].name}
                                  className="object-cover"
                                  fill
                                />
                              </div>
                              <span className="text-sm group-hover:underline">{users[authorId].name}</span>
                              <User className="w-3.5 h-3.5 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>クリックして作成者情報を表示</p>
                          </TooltipContent>
                        </Tooltip>
                      )
                    })}
                  </TooltipProvider>
                </div>
              </div>

              {/* Links */}
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                {selectedWork.githubUrl && (
                  <Button className="gap-2 group w-full" size="lg">
                    <a
                      href={selectedWork.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-full gap-2"
                    >
                      <Github className="w-4 h-4" />
                      GitHubページへ
                      <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  </Button>
                )}
                {selectedWork.url && (
                  <Button variant="outline" className="gap-2 group w-full" size="lg">
                    <a
                      href={selectedWork.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-full gap-2"
                    >
                      <Globe className="w-4 h-4" />
                      作品ページへ
                      <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  </Button>
                )}
              </div>

              {/* Comments */}
              <div className="space-y-3 mt-6">
                <h3 className="text-lg font-medium">コメント</h3>
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
                                  <Image
                                    src={commentUser.icon || "/images/default-avatar.jpeg"}
                                    alt={commentUser.name}
                                    width={32}
                                    height={32}
                                    className="rounded-full"
                                  />
                                ) : (
                                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
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
                                <Image
                                  src={commentUser.icon || "/images/default-avatar.jpeg"}
                                  alt={commentUser.name}
                                  width={32}
                                  height={32}
                                  className="rounded-full"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-gray-200 rounded-full" />
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
                            onClick={() => handleOpenCommentModal(selectedWork)}
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
                  onClick={() => handleOpenCommentModal(selectedWork)}
                  className="w-full sm:w-auto sm:mr-auto"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  コメントを書く
                </Button>
              )}
            </DialogFooter>
            <div className="sticky bottom-0 z-10 p-4 flex justify-end">
              <Button onClick={() => setSelectedWork(null)} className="flex items-center gap-2">
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
                <Image
                  src={selectedUser.icon || "/images/default-avatar.jpeg"}
                  alt="作成者"
                  className="w-16 h-16 rounded-full"
                  width={64}
                  height={64}
                />
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
      {selectedWorkForComment && (
        <Dialog open={true} onOpenChange={() => setSelectedWorkForComment(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>コメントを書く</DialogTitle>
              <DialogDescription>{selectedWorkForComment.name} にコメントを投稿します</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Textarea
                className="min-h-[150px]"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="コメントを入力..."
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedWorkForComment(null)}>
                  キャンセル
                </Button>
                <Button onClick={handleSubmitNewComment} disabled={!newComment.trim()}>
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

// Work card component
function WorkCard({
  work,
  users,
  labels,
  technologies,
  openWorkDetail,
  handleOpenCommentModal,
  currentUserId,
  formatDate,
}: {
  work: WorkType
  users: { [key: string]: UserType }
  labels: { [key: number]: LabelType }
  technologies: { [key: number]: TechnologieType }
  openWorkDetail: (work: WorkType) => void
  handleOpenCommentModal: (work: WorkType) => void
  currentUserId: string | null
  formatDate: (date: string) => string
}) {
  const authorIds = work.authorIds ?? []
  const firstAuthorId = authorIds[0]
  const firstAuthor = firstAuthorId ? users[firstAuthorId] : null
  const othersCount = authorIds.length - 1

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative h-48 overflow-hidden">
        <Image
          src={work.icon || "/images/noimg.png"}
          alt={work.name}
          className="w-full h-full object-cover transition-transform hover:scale-105"
          width={400}
          height={200}
        />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-1">{work.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pb-2">
        <div className="flex flex-wrap gap-1">
          {(work.labelIds ?? []).slice(0, 2).map((labelId) => (
            <Badge
              key={labelId}
              variant="outline"
              className="text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100 inline-flex items-center gap-1"
            >
              <TagIcon className="h-3 w-3" />
              {labels[labelId]?.name}
            </Badge>
          ))}
          {(work.technologieIds ?? []).slice(0, 2).map((technologieId) => (
            <Badge
              key={technologieId}
              variant="outline"
              className="text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 inline-flex items-center gap-1"
            >
              <ChipIcon className="h-3 w-3" />
              {technologies[technologieId]?.name}
            </Badge>
          ))}
          {(work.labelIds?.length || 0) + (work.technologieIds?.length || 0) > 4 && (
            <Badge variant="outline" className="text-xs">
              +{(work.labelIds?.length || 0) + (work.technologieIds?.length || 0) - 4}
            </Badge>
          )}
        </div>

        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5 mr-1" />
          {formatDate(work.date)}
        </div>

        {firstAuthor && (
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Image
                src={firstAuthor.icon || "/images/default-avatar.jpeg"}
                alt="作成者"
                className="w-6 h-6 rounded-full"
                width={24}
                height={24}
              />
              {othersCount > 0 && (
                <div className="absolute -right-2 -bottom-1 bg-primary text-primary-foreground text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  +{othersCount}
                </div>
              )}
            </div>
            <span className="text-sm truncate max-w-[150px]">{firstAuthor.name}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex gap-2 w-full">
          <Button onClick={() => openWorkDetail(work)} className="w-1/2 flex-1" variant="default">
            詳細を見る
          </Button>
          {currentUserId ? (
            <Button variant="outline" onClick={() => handleOpenCommentModal(work)} className="w-1/2 px-3">
              <MessageSquare className="h-4 w-4" />コメントを書く
            </Button>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" className="px-3" disabled>
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>コメントするにはログインが必要です</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
