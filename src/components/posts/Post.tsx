// import { Post as PostData } from "@prisma/client";
import Link from "next/link";
import UserAvatar from "../UserAvatar";
import { formatRelativeDate } from "@/lib/utils";
import { PostData } from "@/lib/types";

interface postProps {
  post: PostData;
}

export default function Post({ post }: postProps) {
  return (
    <article className="space-y-3 rounded-3xl bg-card p-5 shadow">
      <div>
        <Link href={"/users/${post.user.username"}>
            <UserAvatar avatarUrl={post.user.avatarUrl} />
        </Link>
      </div>
      <div>
        <Link href={'/users/${post.user.username}'} className="block font-medium hover:underline">
        {post.user.displayName}
        </Link>
        <Link href={"/posts/${post.id}"} className="block text-sm text-muted-foreground hover:underline">
            {formatRelativeDate(post.createdAt)}
        </Link>
      </div>
      <div className="whitespace-pre-line break-words">{post.content}</div>
    </article>
  );
}
