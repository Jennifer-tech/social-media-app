"use client";
import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import Post from "@/components/posts/Post";
import PostsLoadingSkeleton from "@/components/posts/postsLoadingSkeleton";
import kyInstance from "@/lib/ky";
import { PostPage } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface UserPostsProps {
    userId: string;

}

export default function UserPosts({userId}: UserPostsProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery<PostPage>({
    queryKey: userId ? ["post-feed", "user-posts", userId] : null,
    queryFn:  async ({ pageParam }) => {
      try {
        console.log("Fetching posts with cursor:", pageParam);
        const response = await kyInstance
          .get(
            `api/users/${userId}/posts`,
            pageParam ? { searchParams: { cursor: pageParam } } : {},
          )
          .json<PostPage>();
        console.log("Fetched data:", response);
        return response;
      } catch (error) {
        console.error("Error fetching posts:", error);
        throw error;
      }
    },

    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => {
      console.log("Last page:", lastPage);
      return lastPage?.nextCursor ?? null;
    },
  });
//   console.log("Status:", status);
//   console.log("Data:", data);
//   console.log("Fetching Next Page:", isFetchingNextPage);
//   console.log("Has Next Page:", hasNextPage);

  const posts = data?.pages?.flatMap((page) => page?.posts) || [];
  console.log("posts", posts);

  if (status === "pending") {
    return <PostsLoadingSkeleton />;
  }

  if(status === "success" && !posts.length && !hasNextPage) {
    return <p className="text-center text-muted-foreground">
      This user has&apos;t posted anything yet.
    </p>
  }

  if (status === "error") {
    return (
      <p className="text-center text-destructive">
        An error occurred while loading posts
      </p>
    );
  }
  return (
    <InfiniteScrollContainer
      className="space-y-5"
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
      {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
      
    </InfiniteScrollContainer>
  );
}
