import { useToast } from "@/components/ui/use-toast";
import { useUploadThing } from "@/lib/uploadthing";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { updateUserProfile } from "./action";
import { UpdateUserProfileValues } from "@/lib/validation";
import { PostPage } from "@/lib/types";

export function useUpdateProfileMutation() {
  const { toast } = useToast();

  const router = useRouter();

  const queryClient = useQueryClient();

  const { startUpload: startAvatarUpload } = useUploadThing("avatar");

  const mutation = useMutation({
    mutationFn: async ({
      values,
      avatar,
    }: {
      values: UpdateUserProfileValues;
      avatar?: File;
    }) => {
      console.log("📤 Uploading avatar:", avatar);

      const uploadResponse = avatar
        ? await startAvatarUpload([avatar])
        : [];
      console.log("✅ Upload Response:", uploadResponse);

      return Promise.all([
        updateUserProfile(values),
        // avatar && startAvatarUpload([avatar])
        uploadResponse,
      ]);
    },
    onSuccess: async ([updatedUser, uploadResult]) => {
      console.log("✅ Upload Success! Updated User:", updatedUser);
      console.log("📤 Upload Result:", uploadResult);
      // const newAvatarUrl = uploadResult?.[0].serverData.avatarUrl;
      const newAvatarUrl = uploadResult?.[0]?.fileUrl || updatedUser.avatarUrl;
      console.log("🔗 New Avatar URL:", newAvatarUrl);

      const queryFilter: QueryFilters = {
        queryKey: ["post-feed"],
      };

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<PostPage, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return;

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              posts: page.posts.map((post) => {
                if (post.user.id === updatedUser.id) {
                  return {
                    ...post,
                    user: {
                      ...updatedUser,
                      avatarUrl: newAvatarUrl || updatedUser.avatarUrl,
                    },
                  };
                }
                return post;
              }),
            })),
          };
        },
      );

      router.refresh();

      toast({
        description: "Profile updated",
      });
    },

    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to update profile Please try again",
      });
    },
  });
  return mutation;
}
