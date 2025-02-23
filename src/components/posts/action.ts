'use server'
import { validateRequest } from "@/auth.server";
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";

export async function deletePost(id: string) {
    const {user} = await validateRequest();

    if(!user) throw new Error("unauthorized")

    const post = await prisma.post.findUnique({
        where: { id }
    })
    console.log("delete post action", post)

    if (!post) throw new Error("Post not found");

    if (post.userId !== user.id) throw new Error("unauthorized");

    const deletedPost = await prisma.post.delete({
        where: { id },
        include: getPostDataInclude(user.id)
    });
    console.log("deletedPost", deletedPost)

    return deletedPost;
}