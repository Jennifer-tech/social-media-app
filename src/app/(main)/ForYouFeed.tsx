"use client";
import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import Post from "@/components/posts/Post";
import PostsLoadingSkeleton from "@/components/posts/postsLoadingSkeleton";2
import kyInstance from "@/lib/ky";
import { PostData, PostPage } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function ForYouFeed() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery<PostData[]>({
    queryKey: ["post-feed", "for-you"],
    queryFn: async ({ pageParam }) => {
      try {
        console.log("Fetching posts with cursor:", pageParam);
        const response = await kyInstance
          .get(
            "api/posts/for-you",
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
  console.log("Status:", status);
  console.log("Data:", data);
  console.log("Fetching Next Page:", isFetchingNextPage);
  console.log("Has Next Page:", hasNextPage);

  const posts = data?.pages?.flatMap((page) => page?.posts) || [];
  console.log("posts", posts);

  if (status === "pending") {
    return <PostsLoadingSkeleton />;
  }

  if(status === "success" && !posts.length && !hasNextPage) {
    return <p className="text-center text-muted-foreground">
      No one has posted anything yet.
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
