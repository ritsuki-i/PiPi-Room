"use client"

import type React from "react"

import { useUser } from "@clerk/nextjs"
import { useState, useEffect } from "react"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ProfilePage() {
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({
    name: "",
    accountName: "",
    icon: "",
    email: "",
    birthDate: "",
    bio: "",
    githubUrl: "",
  })

  useEffect(() => {
    if (!user?.id) return

    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile")
        if (!res.ok) {
          console.error("プロフィール取得に失敗しました")
          return
        }
        const data = await res.json()
        setProfile({
          name: data.name || "",
          accountName: data.accountName || "",
          icon: data.icon || "",
          email: data.email || "",
          birthDate: data.birthDate || "",
          bio: data.bio || "",
          githubUrl: data.githubUrl || "",
        })
      } catch (error) {
        console.error("エラーが発生しました:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user?.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    })
  }

  const handleIconFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]
    const previewUrl = URL.createObjectURL(file)

    setProfile({
      ...profile,
      icon: previewUrl,
    })
  }

  const updateProfile = async () => {
    if (!user?.id) {
      alert("ログイン情報がありません")
      return
    }

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      })

      if (res.ok) {
        alert("プロフィールが更新されました")
      } else {
        alert("更新に失敗しました")
      }
    } catch (error) {
      console.error("エラーが発生しました:", error)
      alert("エラーが発生しました")
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">読み込み中...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">プロフィール編集</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-32 h-32">
                <AvatarImage src={profile.icon} alt="Profile" />
                <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <Label htmlFor="icon-upload" className="cursor-pointer">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary">
                  <Upload size={16} />
                  <span>アイコンをアップロード</span>
                </div>
                <Input
                  id="icon-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleIconFileChange}
                  className="hidden"
                />
              </Label>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">名前（表示名）</Label>
                <Input id="name" name="name" value={profile.name} onChange={handleChange} placeholder="名前" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountName">アカウント名</Label>
                <Input
                  id="accountName"
                  name="accountName"
                  value={profile.accountName}
                  onChange={handleChange}
                  placeholder="アカウント名"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleChange}
                  placeholder="メールアドレス"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate">生年月日</Label>
                <Input id="birthDate" name="birthDate" type="date" value={profile.birthDate} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">自己紹介</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  placeholder="自己紹介"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="githubUrl">GitHub URL</Label>
                <Input
                  id="githubUrl"
                  name="githubUrl"
                  value={profile.githubUrl}
                  onChange={handleChange}
                  placeholder="GitHub URL"
                />
              </div>
            </div>

            <Button onClick={updateProfile} className="w-full">
              保存
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

