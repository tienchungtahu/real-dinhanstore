import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { currentUser } from "@clerk/nextjs/server";
import slugify from "slugify";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        // Check if id is integer (id) or string (slug)
        const isId = !isNaN(Number(id));
        const where = isId ? { id: parseInt(id) } : { slug: id };

        const post = await prisma.post.findUnique({
            where,
            include: {
                author: {
                    select: {
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
            },
        });

        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        return NextResponse.json(post);
    } catch (error) {
        console.error("[POST_GET]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const dbUser = await prisma.user.findUnique({
            where: { clerkId: user.id },
        });

        if (!dbUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Only allow update by ID for admin/dashboard usually
        if (isNaN(Number(id))) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const body = await req.json();
        const { title, content, excerpt, coverImage, published, keywords, seoTitle, seoDescription } = body;

        // Check if post exists
        const existingPost = await prisma.post.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existingPost) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        // Update slug if title changed significantly? Usually keep slug stable for SEO, but allow manual update if we add that field. 
        // For now, let's keep slug stable unless explicitly handled? 
        // Simple logic: if title changes, we don't auto-update slug to preserve links. 

        const post = await prisma.post.update({
            where: { id: parseInt(id) },
            data: {
                title,
                content,
                excerpt,
                coverImage,
                published,
                keywords,
                seoTitle,
                seoDescription,
            },
        });

        return NextResponse.json(post);
    } catch (error) {
        console.error("[POST_PUT]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Authorization check could be added here (admin only?)

        if (isNaN(Number(id))) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        await prisma.post.delete({
            where: { id: parseInt(id) },
        });

        return NextResponse.json({ message: "Post deleted" });
    } catch (error) {
        console.error("[POST_DELETE]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
