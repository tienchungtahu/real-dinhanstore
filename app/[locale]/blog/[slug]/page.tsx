import { prisma } from "@/lib/db/prisma"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Metadata } from "next"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Props = {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const post = await prisma.post.findUnique({
        where: { slug },
    })

    if (!post) {
        return {
            title: "Bài viết không tồn tại",
        }
    }

    return {
        title: post.seoTitle || post.title,
        description: post.seoDescription || post.excerpt,
        openGraph: {
            images: post.coverImage ? [post.coverImage] : [],
        }
    }
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params

    const post = await prisma.post.findUnique({
        where: { slug },
        include: {
            author: true,
        },
    })

    if (!post || !post.published) {
        notFound()
    }

    return (
        <article className="container max-w-4xl py-10 mx-auto">
            <div className="space-y-4 text-center mb-10">
                <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                    <span>{format(new Date(post.createdAt), "EEEE, dd/MM/yyyy", { locale: vi })}</span>
                    <span>•</span>
                    <span>Bởi {post.author?.firstName} {post.author?.lastName}</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                    {post.title}
                </h1>
                {post.excerpt && (
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        {post.excerpt}
                    </p>
                )}
            </div>

            {post.coverImage && (
                <div className="relative aspect-video w-full overflow-hidden rounded-xl mb-10 shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={post.coverImage}
                        alt={post.title}
                        className="object-cover w-full h-full"
                    />
                </div>
            )}

            <div className="prose prose-lg dark:prose-invert mx-auto max-w-none">
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>
        </article>
    )
}
