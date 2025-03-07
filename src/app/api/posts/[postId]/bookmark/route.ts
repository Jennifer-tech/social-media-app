import { validateRequest } from "@/auth.server";
import prisma from "@/lib/prisma";
import { BookmarkInfo } from "@/lib/types";

export async function GET(
    req: Request,
    { params: { postId }}: { params: { postId: string }}
) {
    try {
        const { user: loggedInUser } = await validateRequest();
        console.log("loggedInUser", loggedInUser)

        if (!loggedInUser) {
            return Response.json({ error: "Unauthorized" }, { status: 401})
        }

        const bookmark = await prisma.bookmark.findUnique({
            where: {
                userId_postId: {
                    userId: loggedInUser.id,
                    postId,
                }
            }
        })
        console.log("bookmark", bookmark)

        const data: BookmarkInfo = {
            isBookmarkedByUser: !!bookmark,
        }
        console.log("BookmarkInfo", data)

        return Response.json(data);
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Internal server error"}, { status: 500 })
    }
}

export async function POST(
    req: Request,
    { params: { postId }}: { params: { postId: string } },
) {
    try {
        const { user: loggedInUser } = await validateRequest();

        if(!loggedInUser){
            return Response.json({ error: "Unauthorized"}, { status: 401 });
        }

        await prisma.bookmark.upsert({
            where: { 
                userId_postId: {
                    userId: loggedInUser.id,
                    postId
                }
            },
            create: {
                userId: loggedInUser.id,
                postId
            },
            update: {}
        });

        return new Response()
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Internal server error"})
    }
}

export async function DELETE (
    req: Request,
    {params: { postId } } : { params: { postId: string } },
) {
    try {
        const { user: loggedInUser } = await validateRequest();

        if(!loggedInUser) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        await prisma.bookmark.deleteMany()({
            where: { id: postId },
            select: {
                userId: true,
            },
        })

        return new Response();
    } catch (error) {
        console.error(error)
        return Response.json({ error: "Internal Serer Error"}, { status: 500 })
    }
}