import prisma from "@/lib/prisma"
import { UTApi } from "uploadthing/server"

export async function GET(req: Request) {
    try {
        console.log("Received GET request");
        const authHeader = req.headers.get("Authorization")
        console.log("Authorization Header:", authHeader);

        if(authHeader !== `Bearer ${process.env.CRON_SECRET}`){
            console.log("Invalid authorization header");
            return Response.json(
                {message: "Invalid authorization header"},
                {status: 401}
            )
        }

        const unusedMedia = await prisma.media.findMany ({
            where: {
                postId: null, //it means it doesn't belong to a post.
                ...(process.env.NODE_ENV === "production"
                    ? {
                        createdAt: {
                            lte: new Date(Date.now() - 1000 * 60 * 60 * 24),
                        }
                    }: {}
                ),
            },
            select: {
                id: true,
                url: true,
            }
        })
        console.log("unusedMedia", unusedMedia)
        new UTApi().deleteFiles(
            unusedMedia.map(
                (m) => m.url.split(`/a/${process.env.UPLOADTHING_APP_ID}/`)[1],
            ),
        );

        await prisma.media.deleteMany({
            where: {
                id: {
                    in: unusedMedia.map((m) => m.id),
                },
            },
        });

        return new Response()
    } catch(error) {
        console.log(error)
        return Response.json({ error: "Internal Server error" }, { status: 500})
    }
}