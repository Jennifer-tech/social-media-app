import { validateRequest } from "@/auth.server"
import prisma from "@/lib/prisma";
import { createUploadthing, FileRouter} from "uploadthing/next"
import { UploadThingError, UTApi } from "uploadthing/server";


console.log("🚀 File router is initializing...");
const f = createUploadthing()

export const fileRouter = {
    avatar: f({
        image: { maxFileSize: "512KB"}
    })
    .middleware(async () => {
        console.log("🛂 Middleware is running...");
        const {user} = await validateRequest();
        console.log('coreUser', user)

        if (!user) {
            console.error("❌ Unauthorized access detected!");
            throw new UploadThingError("Unauthorized");
        }

        console.log("✅ User validated:", user);
        return { user };
    })
    .onUploadComplete(async ({ metadata, file}) => {
        console.log("📂 Upload complete. File URL:", file);
        console.log("📜 Metadata received:", metadata);

        const oldAvatarUrl = metadata.user.avatarUrl
        console.log("oldAvatarUrl", oldAvatarUrl)

        if(oldAvatarUrl) {
            const key = oldAvatarUrl.split(`/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`,
            )[1];
            console.log("🗑 Deleting old avatar:", oldAvatarUrl);
            console.log("🔑 Extracted key:", key);

            await new UTApi().deleteFiles(key)
        }

        const newAvatarUrl = file.url.replace(
            "/f/",
            `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`,
        )
        // const newAvatarUrl = file.url;
        console.log("newAvatarUrl", newAvatarUrl)

        await prisma.user.update({
            where: {
                id: metadata.user.id
            },
            data: {
                avatarUrl: newAvatarUrl
            }
        })
        console.log("✅ User avatar updated successfully:", newAvatarUrl);
    //     console.log("Upload complete for userId:", metadata.user);
    //   console.log("file url", file.url);

      return { avatarUrl: newAvatarUrl }; 

    }),
    
} satisfies FileRouter;

export type AppFileRouter = typeof fileRouter;