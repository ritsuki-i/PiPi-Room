"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";

export default function ProfilePage() {
  const { user } = useUser();
  const [profile, setProfile] = useState({
    name: user?.fullName || "",
    accountName: "",
    icon: user?.imageUrl || "",
    email: user?.primaryEmailAddress || "",
    birthDate: "",
    bio: "",
    githubUrl: "",
  });

  // 入力値を更新
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // プロフィールを保存
  const saveProfile = async () => {
    const response = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...profile, userId: user?.id }),
    });
  
    if (response.ok) {
      alert("プロフィールが保存されました！");
      window.location.href = "/dashboard"; // ダッシュボードへリダイレクト
    } else {
      alert("エラーが発生しました。");
    }
  };
  

  return (
    <div>
      <h1>プロフィール編集</h1>
      <input type="text" name="name" value={profile.name} onChange={handleChange} placeholder="名前" />
      <input type="text" name="accountName" value={profile.accountName} onChange={handleChange} placeholder="アカウント名" />
      <input type="date" name="birthDate" value={profile.birthDate} onChange={handleChange} />
      <textarea name="bio" value={profile.bio} onChange={handleChange} placeholder="自己紹介"></textarea>
      <input type="text" name="githubUrl" value={profile.githubUrl} onChange={handleChange} placeholder="GitHub URL" />
      <button onClick={saveProfile}>保存</button>
    </div>
  );
}
