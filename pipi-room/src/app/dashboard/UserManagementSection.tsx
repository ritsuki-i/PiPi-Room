"use client"

import { useState, useEffect } from "react"
import { Loader2, Trash2, Search, Shield, Users, ChevronDown, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { UserType } from "@/types"
import { useUser } from "@clerk/nextjs"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { supabase } from "@/lib/supabase"
import type { SearchOptions } from "@supabase/storage-js"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export default function UserManagement() {
  type RoleType = "admin" | "manager" | "member" | "general"
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [editedRoles, setEditedRoles] = useState<Record<string, RoleType>>({})
  const [users, setUsers] = useState<UserType[]>([])
  const [roleFilter, setRoleFilter] = useState<RoleType | "all">("all")
  const { user } = useUser()
  const { toast } = useToast()
  const currentUserId = user?.id

  const handleLocalRoleChange = (userId: string, newRole: RoleType) => {
    setEditedRoles((prev) => ({ ...prev, [userId]: newRole }))
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/user")
      const data = await res.json()
      setUsers(data)
    } catch (err) {
      console.error("ユーザー取得エラー:", err)
      toast({
        variant: "destructive",
        title: "エラーが発生しました",
        description: "ユーザー情報の取得に失敗しました。",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleAllRoleUpdates = async () => {
    setLoading(true)
    const updates = Object.entries(editedRoles)

    for (const [idStr, newRole] of updates) {
      const userId = idStr
      try {
        await fetch(`/api/user/${userId}/role`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: newRole }),
        })

        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, type: newRole } : u)))
      } catch (err) {
        console.error(`ユーザー${userId}のロール更新失敗:`, err)
        toast({
          variant: "destructive",
          title: "エラーが発生しました",
          description: `ユーザーID: ${userId} のロール更新に失敗しました。`,
        })
        setLoading(false)
        return
      }
    }

    setLoading(false)
    setEditedRoles({})

    toast({
      title: "更新完了",
      description: "ユーザーのロールが正常に更新されました。",
      variant: "default",
    })
  }

  type SearchOptionsWithRecursive = SearchOptions & {
    recursive?: boolean
  }

  const deleteUserFiles = async (userId: string, bucket: string) => {
    const listOptions: SearchOptionsWithRecursive | undefined = bucket === "articles" ? { recursive: true } : undefined

    if (bucket === "icons") {
      const { data, error } = await supabase.storage.from(bucket).list(`${userId}/`, listOptions)

      if (error) {
        console.error(`[${bucket}] 一覧取得エラー:`, error.message)
        return
      }

      const filePaths = data?.map((file) => `${userId}/${file.name}`) || []

      if (filePaths.length === 0) {
        console.log(`[${bucket}] 削除対象のファイルなし`)
        return
      }

      const { error: deleteError } = await supabase.storage.from(bucket).remove(filePaths)

      if (deleteError) {
        console.error(`[${bucket}] 削除エラー:`, deleteError.message)
      } else {
        console.log(`ユーザーのアイコン画像を削除しました`)
      }
    } else {
      const { data: folders, error: folderError } = await supabase.storage.from(bucket).list(`${userId}/`) // 再帰せず、まず記事IDフォルダを取る

      if (folderError) {
        console.error("フォルダ一覧取得エラー:", folderError.message)
        return
      }

      const allFilePaths: string[] = []

      for (const folder of folders || []) {
        // 各記事IDフォルダの中のファイルを再取得
        const { data: files, error: fileError } = await supabase.storage.from(bucket).list(`${userId}/${folder.name}/`)

        if (fileError) {
          console.error(`ファイル一覧取得エラー（${folder.name}）:`, fileError.message)
          continue
        }

        const paths = files?.map((file) => `${userId}/${folder.name}/${file.name}`) || []
        allFilePaths.push(...paths)
      }

      if (allFilePaths.length === 0) {
        console.log(`[${bucket}] 削除対象のファイルなし`)
        return
      }

      const { error: deleteError } = await supabase.storage.from(bucket).remove(allFilePaths)

      if (deleteError) {
        console.error(`[${bucket}] 削除エラー:`, deleteError.message)
      } else {
        console.log(`[${bucket}] すべてのファイルを削除しました`)
      }
    }
  }

  const handleDelete = async (userId: string) => {
    try {
      setLoading(true)
      await fetch(`/api/user/${userId}`, { method: "DELETE" })
      try {
        await Promise.all([
          deleteUserFiles(userId, "icons"),
          deleteUserFiles(userId, "work-icon"),
          deleteUserFiles(userId, "articles"),
        ])
      } catch (error) {
        console.error("ユーザーファイルの削除に失敗:", error)
      }
      setUsers(users.filter((u) => u.id !== userId))
      toast({
        title: "削除完了",
        description: "ユーザーを削除しました。",
      })
    } catch (err) {
      console.error("削除失敗:", err)
      toast({
        variant: "destructive",
        title: "エラーが発生しました",
        description: "ユーザーの削除に失敗しました。",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.accountName.toLowerCase().includes(search.toLowerCase())

    const matchesRole = roleFilter === "all" || user.type === roleFilter

    return matchesSearch && matchesRole
  })

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 hover:bg-red-100 border-red-200"
      case "manager":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200"
      case "member":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200"
      case "general":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Admin"
      case "manager":
        return "Manager"
      case "member":
        return "Member"
      case "general":
        return "General"
      default:
        return role
    }
  }

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto mt-[50px] border-blue-200">
        <CardContent className="pt-6 flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
          <h2 className="text-xl font-semibold text-center">データを取得中...</h2>
          <p className="text-muted-foreground text-center">しばらくお待ちください</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">ユーザー管理</h1>
        </div>
        <Button
          onClick={handleAllRoleUpdates}
          disabled={Object.keys(editedRoles).length === 0 || loading}
          className="w-full sm:w-auto"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              処理中...
            </>
          ) : (
            <>ロール変更を反映</>
          )}
        </Button>
      </div>

      <Collapsible>
        <Card>
          <CardHeader className="bg-muted/50">
            <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">ロール別の権限</CardTitle>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
            </CollapsibleTrigger>
            <CardDescription>各ロールの権限と機能について</CardDescription>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Badge className={getRoleBadgeColor("admin")}>admin</Badge>
                  <div className="text-sm">ユーザーの削除、ロールの変更が可能（全権限あり）</div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge className={getRoleBadgeColor("manager")}>manager</Badge>
                  <div className="text-sm">すべての作品・記事の編集・削除が可能</div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge className={getRoleBadgeColor("member")}>member</Badge>
                  <div className="text-sm">Public / Private の作品・記事を閲覧・投稿可能</div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge className={getRoleBadgeColor("general")}>general</Badge>
                  <div className="text-sm">Public の作品・記事を閲覧、コメント可能（投稿不可）</div>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">ユーザー一覧</CardTitle>
          <CardDescription>システムに登録されているユーザーの管理</CardDescription>
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="氏名またはアカウント名で検索"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as RoleType | "all")}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="すべてのロール" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべてのロール</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop View */}
          <div className="hidden md:block rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-8">氏名</TableHead>
                  <TableHead>アカウント名</TableHead>
                  <TableHead>ロール</TableHead>
                  <TableHead className="w-[80px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      該当するユーザーが見つかりません
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium pl-8">{user.name}</TableCell>
                      <TableCell className="text-muted-foreground">@{user.accountName}</TableCell>
                      <TableCell>
                        <Select
                          value={editedRoles[user.id] ?? user.type ?? "general"}
                          onValueChange={(val) => handleLocalRoleChange(user.id, val as RoleType)}
                          disabled={user.id === currentUserId || loading}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="general">General</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="icon"
                              disabled={user.id === currentUserId || loading}
                              className="h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>ユーザーを削除しますか？</AlertDialogTitle>
                              <AlertDialogDescription>
                                この操作は取り消せません。このユーザーのデータはすべて削除されます。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>キャンセル</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(user.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                削除する
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile View */}
          <div className="md:hidden">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">該当するユーザーが見つかりません</div>
            ) : (
              <div className="divide-y">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{user.name}</h3>
                        <p className="text-sm text-muted-foreground">@{user.accountName}</p>
                      </div>
                      <Badge className={getRoleBadgeColor(editedRoles[user.id] ?? user.type ?? "general")}>
                        {getRoleLabel(editedRoles[user.id] ?? user.type ?? "general")}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <Select
                        value={editedRoles[user.id] ?? user.type ?? "general"}
                        onValueChange={(val) => handleLocalRoleChange(user.id, val as RoleType)}
                        disabled={user.id === currentUserId || loading}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="general">General</SelectItem>
                        </SelectContent>
                      </Select>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={user.id === currentUserId || loading}
                            className="ml-2"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            削除
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>ユーザーを削除しますか？</AlertDialogTitle>
                            <AlertDialogDescription>
                              この操作は取り消せません。このユーザーのデータはすべて削除されます。
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>キャンセル</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(user.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              削除する
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-6 pb-4">
          <div className="text-sm text-muted-foreground">{filteredUsers.length} 人のユーザーが表示されています</div>
          {Object.keys(editedRoles).length > 0 && (
            <Button onClick={handleAllRoleUpdates} disabled={loading} size="sm" className="md:hidden">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  処理中...
                </>
              ) : (
                <>ロール変更を反映</>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
      <Toaster />
    </div>
  )
}

