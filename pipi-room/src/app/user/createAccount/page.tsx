"use client"

import type React from "react"

import { useUser } from "@clerk/nextjs"
import { useState, useEffect } from "react"
import { User, AtSign, Calendar, FileText, Github, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Notification {
  message: string
  type: "success" | "error"
}

export default function ProfilePage() {
  const { user } = useUser()
  const [profile, setProfile] = useState({
    name: user?.fullName || "",
    accountName: "",
    icon: user?.imageUrl || "",
    email: user?.primaryEmailAddress?.emailAddress || "",
    birthDate: "",
    bio: "",
    githubUrl: "",
  })
  const [notification, setNotification] = useState<Notification | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    const previewUrl = URL.createObjectURL(file)
    setProfile({ ...profile, icon: previewUrl })
  }

  const handleIconReset = () => {
    setProfile({ ...profile, icon: "" })
  }

  const saveProfile = async () => {
    try {
      const response = await fetch("/api/user/createAccount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profile, userId: user?.id }),
      })
      if (response.ok) {
        setNotification({ message: "プロフィールが保存されました", type: "success" })
        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 2000)
      } else {
        throw new Error("保存に失敗しました")
      }
    } catch (error) {
      setNotification({ message: "名前とアカウント名、生年月日を入力してください。", type: "error" })
    }
  }

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  return (
    <div className="container mx-auto p-4">
      {notification && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-md ${
            notification.type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          {notification.message}
        </div>
      )}
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">アカウント登録</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-32 h-32">
              <AvatarImage src={profile.icon} alt="Profile" />
              <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex space-x-2">
              <Label htmlFor="icon-upload" className="cursor-pointer">
                <div className="flex items-center space-x-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md">
                  <Upload size={16} />
                  <span>アイコンをアップロード</span>
                </div>
                <Input id="icon-upload" type="file" accept="image/*" onChange={handleIconUpload} className="hidden" />
              </Label>
              {profile.icon && (
                <Button variant="outline" onClick={handleIconReset}>
                  <X size={16} className="mr-2" />
                  リセット
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">名前</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  id="name"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  placeholder="名前"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountName">アカウント名</Label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  id="accountName"
                  name="accountName"
                  value={profile.accountName}
                  onChange={handleChange}
                  placeholder="アカウント名"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">生年月日</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  value={profile.birthDate}
                  onChange={handleChange}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">自己紹介</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400" />
                <Textarea
                  id="bio"
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  placeholder="自己紹介"
                  rows={4}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="githubUrl">GitHub URL</Label>
              <div className="relative">
                <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  id="githubUrl"
                  name="githubUrl"
                  value={profile.githubUrl}
                  onChange={handleChange}
                  placeholder="https://github.com/yourusername"
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={saveProfile} className="w-full">
            保存
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

