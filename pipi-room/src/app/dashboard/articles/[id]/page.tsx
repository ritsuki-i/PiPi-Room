"use client"

import { useState, useEffect, ChangeEvent, useRef } from "react"
import { Loader2, ImageIcon, SaveIcon, EyeIcon, PencilIcon } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { useParams, useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ReactMarkdown from "react-markdown"
import { supabase } from "@/lib/supabase";

export default function EditArticlePage() {
    const { user } = useUser();
    const [userId, setUserId] = useState(null);

    const params = useParams()
    const router = useRouter()
    const articleId = params.id as string

    const [markdown, setMarkdown] = useState("")
    const [mode, setMode] = useState<"write" | "preview">("write")
    const [imageMap, setImageMap] = useState<Record<string, { base64: string; file: File }>>({});
    const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
    const [status, setStatus] = useState<"draft" | "public" | "private">("draft")
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [cursorPos, setCursorPos] = useState<{ start: number; end: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [markdownForPreview, setMarkdownForPreview] = useState(markdown);

    useEffect(() => {
        const checkUserExists = async () => {

            try {
                const res = await fetch("/api/user/check");
                const data = await res.json();

                setUserId(data.userId);
                if (!data.exists) {
                    // ✅ ユーザーが存在しない場合 `/user/createAccount` にリダイレクト
                    router.push("/user/createAccount");
                }
            } catch (error) {
                console.error("ユーザーの存在チェックに失敗しました:", error);
            }
        };


        // 初期記事データを取得
        const fetchArticle = async () => {
            const res = await fetch(`/api/articles/${articleId}`)
            const data = await res.json()
            setMarkdown(data.content || "")
            setStatus(data.type || "draft")
        }

        async function displayDashboard() {
            await checkUserExists();
            await fetchArticle();
        }

        displayDashboard();
        setLoading(false);
    }, [articleId, user?.id, user])

    useEffect(() => {
        if (mode !== "preview") return;

        let newMarkdown = markdown;

        uploadedUrls.forEach((url) => {
            const base64 = imageMap[url]?.base64;
            if (base64) {
                const regex = new RegExp(`!\\[([^\\]]*)\\]\\(https://qbjopokpqxzwyiyezzbs.supabase.co/storage/v1/object/public/articles/${url}\\)`, "g");
                newMarkdown = newMarkdown.replace(regex, `![$1](${base64})`);
            }
        });

        setMarkdownForPreview(newMarkdown);
        console.log(newMarkdown)
    }, [mode, markdown, uploadedUrls, imageMap]);

    const insertAtCursor = (text: string) => {
        const el = textareaRef.current;
        if (!el || !cursorPos) return;

        const before = markdown.slice(0, cursorPos.start);
        const after = markdown.slice(cursorPos.end);
        const newMarkdown = before + text + after;

        setMarkdown(newMarkdown);

        setTimeout(() => {
            el.focus();
            const pos = cursorPos.start + text.length;
            el.setSelectionRange(pos, pos);
        }, 0);
    };

    const handleImageInsert = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !userId) return;

        const fakePath = `${userId}/${articleId}/${file.name}`;
        const alt = "画像の説明";
        const markdownImage = `![${alt}](https://qbjopokpqxzwyiyezzbs.supabase.co/storage/v1/object/public/articles/${fakePath})`;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;

            insertAtCursor(markdownImage);

            setImageMap((prev) => ({
                ...prev,
                [fakePath]: {
                    base64,
                    file,
                },
            }));
            setUploadedUrls((prev) => [...prev, fakePath]);
        };
        reader.readAsDataURL(file);
    };


    const handleSave = async () => {

        await Promise.all(
            uploadedUrls.map(async (url) => {
                const image = imageMap[url];
                if (!image) return;

                const { error } = await supabase.storage
                    .from("articles")
                    .upload(url, image.file, { upsert: true });

                if (error) {
                    console.error(`アップロード失敗: ${url}`, error.message);
                } else {
                    console.log(`アップロード成功: ${url}`);
                }
            })
        );

        const res = await fetch(`/api/articles/${articleId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                content: markdown,
                type: status,
            }),
        })

        if (res.ok) {
            alert("保存しました")
            router.push("/dashboard")
        } else {
            alert("保存に失敗しました")
        }
    }

    // Loading state
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
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            <Card className="border shadow-sm">
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <Tabs
                            defaultValue="write"
                            value={mode}
                            onValueChange={(value) => setMode(value as "write" | "preview")}
                            className="w-full sm:w-auto"
                        >
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="write" className="flex items-center gap-2">
                                    <PencilIcon className="h-4 w-4" />
                                    <span>書く</span>
                                </TabsTrigger>
                                <TabsTrigger value="preview" className="flex items-center gap-2">
                                    <EyeIcon className="h-4 w-4" />
                                    <span>プレビュー</span>
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2"
                            >
                                <ImageIcon className="h-4 w-4" />
                                <span>画像を挿入</span>
                            </Button>
                            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageInsert} className="hidden" />

                            <Select value={status} onValueChange={(value) => setStatus(value as any)}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="ステータス" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Preview">下書き</SelectItem>
                                    <SelectItem value="Public">公開</SelectItem>
                                    <SelectItem value="Private">限定公開</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {mode === "write" ? (
                        <Textarea
                            ref={textareaRef}
                            value={markdown}
                            onChange={(e) => setMarkdown(e.target.value)}
                            onClick={() => {
                                const el = textareaRef.current;
                                if (el) {
                                    setCursorPos({ start: el.selectionStart, end: el.selectionEnd });
                                }
                            }}
                            onKeyUp={() => {
                                const el = textareaRef.current;
                                if (el) {
                                    setCursorPos({ start: el.selectionStart, end: el.selectionEnd });
                                }
                            }}
                            placeholder="マークダウンで記事を書いてください..."
                            className="min-h-[400px] font-mono text-sm"
                        />
                    ) : (
                        <Card className="border rounded-md bg-muted/30">
                            <CardContent className="p-6 prose dark:prose-invert max-w-none">
                                {markdown ? (
                                    <ReactMarkdown
                                        components={{
                                            img: ({ ...props }) => (
                                                <div className="flex justify-center my-4">
                                                    <img {...props} className="max-w-full h-auto" />
                                                </div>
                                            ),
                                        }}
                                        urlTransform={(value: string) => value}
                                    >
                                        {markdownForPreview}
                                    </ReactMarkdown>
                                ) : (
                                    <div className="text-muted-foreground italic text-center py-12">
                                        プレビューするコンテンツがありません。記事を書いてください。
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    <div className="mt-6 flex justify-end">
                        <Button onClick={handleSave} className="flex items-center gap-2">
                            <SaveIcon className="h-4 w-4" />
                            <span>記事を保存</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
