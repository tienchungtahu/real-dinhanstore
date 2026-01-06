"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Sparkles, Upload, FileText } from "lucide-react"
import { TiptapEditor } from "@/app/admin/components/tiptap-editor"
import { toast } from "sonner"

export default function EditPostPage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params);
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [generating, setGenerating] = useState(false)

    // Form State
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [excerpt, setExcerpt] = useState("")
    const [coverImage, setCoverImage] = useState("")
    const [published, setPublished] = useState(false)
    const [seoTitle, setSeoTitle] = useState("")
    const [seoDescription, setSeoDescription] = useState("")

    // AI State
    const [aiKeywords, setAiKeywords] = useState("")
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const [parsedContext, setParsedContext] = useState("")

    useEffect(() => {
        async function fetchPost() {
            try {
                const res = await fetch(`/api/posts/${params.id}`)
                if (!res.ok) {
                    toast.error("Không tìm thấy bài viết")
                    router.push("/admin/posts")
                    return
                }
                const data = await res.json()
                setTitle(data.title)
                setContent(data.content)
                setExcerpt(data.excerpt || "")
                setCoverImage(data.coverImage || "")
                setPublished(data.published)
                setSeoTitle(data.seoTitle || "")
                setSeoDescription(data.seoDescription || "")
                setAiKeywords(data.keywords || "")
            } catch (error) {
                toast.error("Lỗi tải bài viết")
            } finally {
                setFetching(false)
            }
        }
        fetchPost()
    }, [params.id, router])

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploadedFile(file)
        const formData = new FormData()
        formData.append("file", file)

        const toastId = toast.loading("Đang đọc file...")

        try {
            const res = await fetch("/api/utils/parse-file", {
                method: "POST",
                body: formData,
            })
            const data = await res.json()

            if (res.ok) {
                setParsedContext(data.text)
                toast.success("Đã đọc nội dung file", { id: toastId })
            } else {
                toast.error(data.error || "Lỗi đọc file", { id: toastId })
            }
        } catch (error) {
            toast.error("Lỗi kết nối", { id: toastId })
        }
    }

    const handleGenerateAI = async () => {
        if (!aiKeywords && !parsedContext) {
            toast.error("Vui lòng nhập từ khóa hoặc upload file tài liệu")
            return
        }

        setGenerating(true)
        try {
            const res = await fetch("/api/ai/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    context: parsedContext,
                    keywords: aiKeywords,
                }),
            })

            const data = await res.json()

            if (res.ok) {
                // Here we might ask user if they want to overwrite
                if (confirm("AI đã tạo xong nội dung mới. Bạn có muốn ghi đè nội dung hiện tại không?")) {
                    setTitle(data.title)
                    setExcerpt(data.excerpt)
                    setContent(data.content)
                    setSeoTitle(data.title)
                    setSeoDescription(data.excerpt)
                    toast.success("Đã cập nhật nội dung từ AI")
                }
            } else {
                toast.error(data.error || "Lỗi tạo nội dung AI")
            }
        } catch (error) {
            toast.error("Lỗi kết nối đến AI service")
        } finally {
            setGenerating(false)
        }
    }

    const handleSubmit = async () => {
        if (!title || !content) {
            toast.error("Tiêu đề và nội dung là bắt buộc")
            return
        }

        setLoading(true)
        try {
            const res = await fetch(`/api/posts/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    content,
                    excerpt,
                    coverImage,
                    published,
                    keywords: aiKeywords,
                    seoTitle,
                    seoDescription,
                }),
            })

            if (res.ok) {
                toast.success("Cập nhật bài viết thành công")
                router.push("/admin/posts")
            } else {
                toast.error("Lỗi khi lưu bài viết")
            }
        } catch (error) {
            toast.error("Lỗi kết nối")
        } finally {
            setLoading(false)
        }
    }

    if (fetching) {
        return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin" /></div>
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-10">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Chỉnh sửa bài viết</h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.back()}>Hủy</Button>
                    <Button onClick={handleSubmit} disabled={loading || generating}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Lưu thay đổi
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Nội dung</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Tiêu đề bài viết</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Nhập tiêu đề hoặc dùng AI tạo..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="excerpt">Tóm tắt (Excerpt)</Label>
                                <Textarea
                                    id="excerpt"
                                    value={excerpt}
                                    onChange={(e) => setExcerpt(e.target.value)}
                                    placeholder="Mô tả ngắn gọn về bài viết..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Nội dung chi tiết</Label>
                                <TiptapEditor content={content} onChange={setContent} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>SEO & Metadata</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>SEO Title</Label>
                                <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>SEO Description</Label>
                                <Textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar / AI Tools */}
                <div className="space-y-6">
                    <Card className="bg-muted/30 border-primary/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-primary">
                                <Sparkles className="h-5 w-5" />
                                AI Assistant
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-center w-full">
                                <label htmlFor="file-upload-edit" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        {uploadedFile ? (
                                            <FileText className="h-8 w-8 text-green-500 mb-2" />
                                        ) : (
                                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                        )}

                                        <p className="text-sm text-muted-foreground">
                                            {uploadedFile ? uploadedFile.name : "Tải lên context mới"}
                                        </p>
                                    </div>
                                    <input id="file-upload-edit" type="file" className="hidden" accept=".docx,.xlsx,.xls" onChange={handleFileUpload} />
                                </label>
                            </div>

                            <div className="space-y-2">
                                <Label>Từ khóa chính</Label>
                                <Input
                                    value={aiKeywords}
                                    onChange={(e) => setAiKeywords(e.target.value)}
                                    placeholder="VD: vợt cầu lông, yonex..."
                                />
                            </div>

                            <Button
                                onClick={handleGenerateAI}
                                disabled={generating}
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                            >
                                {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                Tạo lại nội dung với AI
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Cấu hình đăng</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="published">Xuất bản</Label>
                                <Switch
                                    id="published"
                                    checked={published}
                                    onCheckedChange={setPublished}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Ảnh bìa (URL)</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={coverImage}
                                        onChange={(e) => setCoverImage(e.target.value)}
                                        placeholder="https://..."
                                    />
                                </div>
                                {coverImage && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={coverImage} alt="Cover" className="w-full h-32 object-cover rounded-md mt-2" />
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
