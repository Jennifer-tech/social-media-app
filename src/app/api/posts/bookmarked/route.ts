// import { validateRequest } from "@/auth.server";
import { validateRequest } from "@/auth.server";
import prisma from "@/lib/prisma"
import { getPostDataInclude, PostPage } from "@/lib/types"
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
        // console.log("cursor", cursor)

        const pageSize = 10
        
        const { user } = await validateRequest()

        if(!user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 })
        }

        const bookmarks = await prisma.bookmark.findMany({
            where: {
                userId: user.id
            },
            include: {
                post: {
                    include: getPostDataInclude(user.id)
                }
            },
            orderBy: {
                createdAt: "desc"
            },
            take: pageSize + 1,
            cursor: cursor ? {id: cursor} : undefined
        })

        // console.log("posts", posts)
        const nextCursor = bookmarks.length > pageSize ? bookmarks[pageSize].id : null
        // console.log("nextCursor", nextCursor)
        const data: PostPage = {
            posts: bookmarks.slice(0, pageSize).map(bookmark => bookmark.post),
            nextCursor
        }
        // console.log("data", data)
        return Response.json(data);
    } catch(error) {
        console.error(error)
        return Response.json({ error: "Internal Server error" }, { status: 500})
    }
}