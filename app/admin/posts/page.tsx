"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search as SearchIcon, MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { toast } from "sonner"

interface Post {
    id: number
    title: string
    slug: string
    published: boolean
    createdAt: string
    author: {
        firstName: string | null
        lastName: string | null
    } | null
}

export default function PostsPage() {
    const router = useRouter()
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        fetchPosts()
    }, [])

    const fetchPosts = async () => {
        try {
            const res = await fetch("/api/posts")
            const data = await res.json()
            if (Array.isArray(data)) {
                setPosts(data)
            }
        } catch (error) {
            toast.error("Không thể tải danh sách bài viết")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Bạn có chắc chắn muốn xóa bài viết này?")) return

        try {
            const res = await fetch(`/api/posts/${id}`, {
                method: "DELETE",
            })

            if (res.ok) {
                toast.success("Đã xóa bài viết")
                fetchPosts()
            } else {
                toast.error("Lỗi khi xóa bài viết")
            }
        } catch (error) {
            toast.error("Lỗi kết nối")
        }
    }

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Bài viết</h1>
                    <p className="text-muted-foreground">
                        Quản lý các bài viết tin tức, blog của cửa hàng
                    </p>
                </div>
                <Button onClick={() => router.push("/admin/posts/create")}>
                    <Plus className="mr-2 h-4 w-4" /> Tạo bài viết
                </Button>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm bài viết..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[400px]">Tiêu đề</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Tác giả</TableHead>
                            <TableHead>Ngày tạo</TableHead>
                            <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    Đang tải...
                                </TableCell>
                            </TableRow>
                        ) : filteredPosts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    Chưa có bài viết nào
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredPosts.map((post) => (
                                <TableRow key={post.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{post.title}</span>
                                            <span className="text-xs text-muted-foreground">{post.slug}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {post.published ? (
                                            <Badge variant="default" className="bg-green-600">Đã xuất bản</Badge>
                                        ) : (
                                            <Badge variant="secondary">Bản nháp</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {post.author ? `${post.author.firstName} ${post.author.lastName}` : "Unknown"}
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(post.createdAt), "dd/MM/yyyy", { locale: vi })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => router.push(`/blog/${post.slug}`)}>
                                                    <Eye className="mr-2 h-4 w-4" /> Xem (Public)
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => router.push(`/admin/posts/${post.id}`)}>
                                                    <Pencil className="mr-2 h-4 w-4" /> Chỉnh sửa
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => handleDelete(post.id)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" /> Xóa
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
