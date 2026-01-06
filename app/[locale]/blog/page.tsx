import { prisma } from "@/lib/db/prisma"
import { Metadata } from "next"
import Link from "next/link"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
    title: "Blog & Tin tức | Dinhan Store",
    description: "Cập nhật tin tức, kiến thức cầu lông mới nhất từ Dinhan Store",
}

export default async function BlogPage() {
    const posts = await prisma.post.findMany({
        where: { published: true },
        orderBy: { createdAt: "desc" },
        include: {
            author: {
                select: {
                    firstName: true,
                    lastName: true,
                    avatar: true,
                },
            },
        },
    })

    return (
        <div className="container py-10 mx-auto">
            <div className="flex flex-col items-center mb-10 text-center">
                <h1 className="text-4xl font-bold tracking-tight mb-4">Blog & Tin Tức</h1>
                <p className="text-xl text-muted-foreground max-w-2xl">
                    Chia sẻ kiến thức, kinh nghiệm và tin tức mới nhất về bộ môn cầu lông.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                    <Link key={post.id} href={`/blog/${post.slug}`} className="group hover:no-underline">
                        <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg border-muted/60">
                            <div className="aspect-video relative overflow-hidden bg-muted">
                                {post.coverImage ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={post.coverImage}
                                        alt={post.title}
                                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full text-muted-foreground bg-secondary">
                                        No Image
                                    </div>
                                )}
                            </div>
                            <CardHeader className="p-5">
                                <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                                    <Badge variant="secondary" className="font-normal">News</Badge>
                                    <span>•</span>
                                    <span>{format(new Date(post.createdAt), "dd MMM yyyy", { locale: vi })}</span>
                                </div>
                                <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                    {post.title}
                                </h3>
                            </CardHeader>
                            <CardContent className="p-5 pt-0">
                                <p className="text-muted-foreground line-clamp-3 text-sm">
                                    {post.excerpt}
                                </p>
                            </CardContent>
                            <CardFooter className="p-5 pt-0 mt-auto flex items-center gap-2">
                                <div className="text-sm font-medium text-muted-foreground">
                                    {post.author ? `${post.author.firstName} ${post.author.lastName}` : "Dinhan Store"}
                                </div>
                            </CardFooter>
                        </Card>
                    </Link>
                ))}
            </div>

            {posts.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                    Chưa có bài viết nào được xuất bản.
                </div>
            )}
        </div>
    )
}
