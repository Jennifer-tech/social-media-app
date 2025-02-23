import { validateRequest } from "@/auth.server";
import prisma from "@/lib/prisma";
import { getPostDataInclude, PostPage } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    console.log("cursor", cursor);

    const pageSize = 10;

    const { user } = await validateRequest();
    console.log("user(followers)", user)

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const posts = await prisma.post.findMany({
      where: {
        user: {
          followers: {
            some: {
              followerId: user.id,
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
      include: getPostDataInclude(user.id),
    });
    console.log("posts", posts);
    const nextCursor = posts.length > pageSize ? posts[pageSize].id : null;
    console.log("nextCursor", nextCursor);
    const data: PostPage = {
      posts: posts.slice(0, pageSize),
      nextCursor,
    };
    console.log("data", data);
    return Response.json(data);
  } catch (error) {
    console.error(error);
    return new Response(
        JSON.stringify({ error: "Internal Server error" }),
        { status: 500 }
      );
    }
}
