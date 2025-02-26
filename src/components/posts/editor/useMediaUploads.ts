import { useToast } from "@/components/ui/use-toast";
import { useUploadThing } from "@/lib/uploadthing";
import { useState } from "react";

export interface Attachment {
    file: File;
    mediaId?: string;
    isUploading: boolean;
}

export default function useMediaUpload() {
    const {toast} = useToast();

    const [attachments, setAttachments] = useState<Attachment[]>([]);

    const [uploadProgress, setUploadProgress] = useState<number>();

    const {startUpload, isUploading} = useUploadThing("attachment", {
        onBeforeUploadBegin(files) {
            console.log("🟡 Starting upload for files:", files);

            const renamedFiles = files.map((file) => {
                const extension = file.name.split(".").pop();
                console.log("🔹 File extension:", extension);

                const newFile = new File(
                    [file],
                    `attachment_${crypto.randomUUID()}.${extension}`,
                    { type: file.type }
                );

                console.log("📁 Renamed file:", newFile.name);
                return newFile;
            })

            setAttachments(prev => [
                ...prev,
                ...renamedFiles.map((file) => ({
                    file, 
                    isUploading: true
                }))
            ]);

            console.log("🟢 Attachments after rename:", attachments);

            return renamedFiles;
        },
        onUploadProgress: setUploadProgress,
        onClientUploadComplete(res) {
            console.log("✅ Upload complete! Response:", res);
            setAttachments((prev) => prev.map((a) => {
                const uploadResult = res.find((r) => r.name === a.file.name);
                console.log("🔍 Matching upload result:", uploadResult);

                if(!uploadResult) return a;

                return {
                    ...a,
                    mediaId: uploadResult.serverData.mediaId,
                    isUploading: false,
                }
            }))
            console.log("🟢 Attachments after upload complete:", attachments);
        },
        onUploadError(e) {
            console.error("❌ Upload error:", e.message);
            setAttachments((prev) => prev.filter((a) => !a.isUploading));
            toast({
                variant: "destructive",
                description: e.message,
            });
        },
    });

    function handleStartUpload(files: File[]) {
        console.log("🚀 Initiating upload with files:", files);
        if(isUploading) {
            console.warn("⚠️ Upload already in progress!");
            toast({
                variant: "destructive",
                description: "Please wait for the current upload to finish.",
            });
            return;
        }

        if (attachments.length + files.length > 5) {
            console.warn("⚠️ Upload limit exceeded!");

            toast({
                variant: "destructive",
                description: "You can only upload up to 5 attachments per post",
            });
            return;
        }

        startUpload(files);
    }

    function removeAttachment(fileName: string) {
        console.log(`🗑 Removing attachment: ${fileName}`);
        setAttachments((prev) => prev.filter((a) => a.file.name !== fileName));
    }

    function reset() {
        console.log("🔄 Resetting attachments and progress.");
        setAttachments([]);
        setUploadProgress(undefined)
    }

    return {
        startUpload: handleStartUpload,
        attachments,
        isUploading,
        uploadProgress,
        removeAttachment,
        reset,
    }
}