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

  // 入力値を更新するハンドラ
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // アイコン画像ファイルを選択 → プレビューURLを作成
  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    // 選択したファイルのプレビューURLを生成 (ブラウザ限定)
    const previewUrl = URL.createObjectURL(file);
    // ステートにプレビューURLを格納（本番ではサーバーにアップ後のURLを入れるなど要検討）
    setProfile({ ...profile, icon: previewUrl });
  };

  // アイコンをリセット（または再変更）
  const handleIconReset = () => {
    setProfile({ ...profile, icon: "" });
  };

  // プロフィールを保存（POSTリクエスト例）
  const saveProfile = async () => {
    const response = await fetch("/api/createAccount", {
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

      <div>
        <label>名前</label>
        <input
          type="text"
          name="name"
          value={profile.name}
          onChange={handleChange}
          placeholder="名前"
        />
      </div>

      <div>
        <label>アカウント名</label>
        <input
          type="text"
          name="accountName"
          value={profile.accountName}
          onChange={handleChange}
          placeholder="アカウント名"
        />
      </div>

      <div>
        <label>生年月日</label>
        <input
          type="date"
          name="birthDate"
          value={profile.birthDate}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>自己紹介</label>
        <textarea
          name="bio"
          value={profile.bio}
          onChange={handleChange}
          placeholder="自己紹介"
        />
      </div>

      <div>
        <label>GitHub URL</label>
        <input
          type="text"
          name="githubUrl"
          value={profile.githubUrl}
          onChange={handleChange}
          placeholder="GitHub URL"
        />
      </div>

      {/* ▼ ここからアイコン登録エリア ▼ */}
      <div>
        <label>アイコン</label>
        {/* プレビュー表示 */}
        {profile.icon && (
          <div style={{ margin: "10px 0" }}>
            <img
              src={profile.icon}
              alt="icon preview"
              style={{ width: "100px", height: "100px", objectFit: "cover" }}
            />
          </div>
        )}

        <div style={{ margin: "8px 0" }}>
          {/* ファイル選択ボタン */}
          <input type="file" accept="image/*" onChange={handleIconUpload} />
          {/* 変更(リセット)ボタン */}
          <button type="button" onClick={handleIconReset}>
            アイコンを変更
          </button>
        </div>
      </div>
      {/* ▲ アイコン登録エリアおわり ▲ */}

      <button onClick={saveProfile}>保存</button>
    </div>
  );
}
