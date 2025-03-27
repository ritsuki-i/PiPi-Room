"use client"

import type React from "react"
import { useUser } from "@clerk/nextjs"
import { useState, useEffect } from "react"
import { User, AtSign, FileText, Github, Upload, GraduationCap, Globe, Mail, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({
    name: "",
    accountName: "",
    icon: "",
    email: "",
    enrollmentYear: "",
    bio: "",
    portfolioUrl: "",
    githubUrl: "",
    type: ""
  })

  const currentYear = new Date().getFullYear();
  const maxYear = currentYear + 1;

  const RoleBadge = ({ role }: { role: string | null }) => {
    // Define styling for each role type
    const badgeStyles = {
      admin: "bg-red-100 text-red-800 hover:bg-red-100 border-red-200",
      manager: "bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200",
      member: "bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200",
      general: "bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200",
    }

    // Get the appropriate style or default to general if role doesn't match
    const style = badgeStyles[role as keyof typeof badgeStyles] || badgeStyles.general

    return (
      <Badge variant="outline" className={`font-medium ${style}`}>
        {role}
      </Badge>
    )
  }

  useEffect(() => {
    if (!user?.id) return

    const checkUserExists = async () => {

      try {
        const res = await fetch("/api/user/check");
        const data = await res.json();

        if (!data.exists) {
          // ✅ ユーザーが存在しない場合 `/user/createAccount` にリダイレクト
          router.push("/user/createAccount");
        }
      } catch (error) {
        console.error("ユーザーの存在チェックに失敗しました:", error);
      }
    };

    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user/profile")
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
          enrollmentYear: data.enrollmentYear || "",
          bio: data.bio || "",
          portfolioUrl: data.portfolioUrl || "",
          githubUrl: data.githubUrl || "",
          type: data.type || "",
        })
      } catch (error) {
        console.error("エラーが発生しました:", error)
      } finally {
        setLoading(false)
      }
    }

    async function displayDashboard() {
      await checkUserExists();
      await fetchProfile();
    }

    displayDashboard();

  }, [user?.id, user, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    })
  }

  const handleIconFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      const base64Data = reader.result as string; // Base64 形式の画像データ
      setProfile({ ...profile, icon: base64Data }); // プレビュー用に設定
    };

    reader.readAsDataURL(file);
  }

  const updateProfile = async () => {
    if (!user?.id) {
      alert("ログイン情報がありません")
      return
    }

    try {
      const res = await fetch("/api/user/profile", {
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
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex mb-3">
            <div className="flex items-center gap-1.5 text-sm font-medium mr-4">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>現在の権限</span>
            </div>
            <RoleBadge role={profile.type} />
          </div>
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
                <Label htmlFor="name">名前<span className="text-red-500 ml-1">*</span></Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="name"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    placeholder="名前"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountName">アカウント名<span className="text-red-500 ml-1">*</span></Label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="accountName"
                    name="accountName"
                    value={profile.accountName}
                    onChange={handleChange}
                    placeholder="アカウント名"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profile.email}
                    onChange={handleChange}
                    placeholder="メールアドレス"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="enrollmentYear">大学入学年<span className="text-red-500 ml-1">*</span></Label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="enrollmentYear"
                    name="enrollmentYear"
                    type="number"
                    min={2010}
                    max={maxYear}
                    value={profile.enrollmentYear}
                    onChange={handleChange}
                    className="pl-10"
                    required />
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
                <Label htmlFor="portfolioUrl">ポートフォリオ URL</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="portfolioUrl"
                    name="portfolioUrl"
                    value={profile.portfolioUrl}
                    onChange={handleChange}
                    placeholder="https://ritsuki-i.github.io/yourusername"
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

            <Button onClick={updateProfile} className="w-full">
              保存
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

