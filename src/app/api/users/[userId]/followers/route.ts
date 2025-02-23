import { validateRequest } from "@/auth.server"
import prisma from "@/lib/prisma";
import { FollowerInfo } from "@/lib/types";

export async function GET(
    req: Request,
    { params: {userId } }: { params: { userId: string } },
) {
    try {
        const { user: loggedInUser} = await validateRequest();
        console.log("loggedInUser", loggedInUser)

        if(!loggedInUser) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401})
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                followers: {
                    where: {
                        followerId: loggedInUser.id,
                    },
                    select: {
                        followerId: true,
                    },
                },
                _count: {
                    select: {
                        followers: true
                    },
                },
            },
        });
        console.log("user", user)

        if(!user) {
            return new Response(JSON.stringify({ error: "User not found"}), { status: 404 });
        }

        const data: FollowerInfo = {
            followers: user._count.followers,
            isFollowedByUser: !!user.followers.length,
        };
        console.log("data", data)

        return new Response(JSON.stringify(data));
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: "Internal server error"}), { status: 500 })
    }
}

export async function POST (
    req: Request,
    context: { params: {userId: string}},
) {
    try {
        const { userId } = await context.params
        console.log("userId", userId)
        const { user: loggedInUser } = await validateRequest();
        console.log("loggedInUserPost", loggedInUser)

        if(!loggedInUser) {
            return Response.json({ error: "Unauthorized" }, { status: 401 })
        }

        const user = await prisma.follow.upsert({
            where: {
                followerId_followingId:{
                    followerId: loggedInUser.id,
                    followingId: userId,
                },
            },
            create: {
                followerId: loggedInUser.id,
                followingId: userId,
            },
            update: {},
        });
        console.log("userPost", user)

        return new Response(JSON.stringify({ success: true }));
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Internal server error"}, {status: 500})
    }
}

export async function DELETE(
    req: Request,
    { params: {userId}}: {params: {userId: string}},
) {
    try {
        const { user: loggedInUser } = await validateRequest();

        if(!loggedInUser) {
            return Response.json({ error: "Unauthorized"}, {status: 401})
        }

        await prisma.follow.deleteMany({
            where: {
                followerId: loggedInUser.id,
                followingId: userId
            },
        });

        return new Response();
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Internal server error"}, { status: 500})
    }
}