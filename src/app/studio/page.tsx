import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/modules/auth";
import { timeAgo } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const StudioDashboard = async () => {
  const session = await auth();
  const [pageCount, publishedCount, postCount, mediaCount, recentRevisions, draftPosts] = await Promise.all([
    db.page.count(),
    db.page.count({ where: { status: "PUBLISHED" } }),
    db.post.count(),
    db.media.count({ where: { deletedAt: null } }),
    db.pageRevision.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { page: { select: { id: true, title: true, path: true } }, author: { select: { name: true } } },
    }),
    db.post.findMany({
      where: { status: { in: ["DRAFT", "SCHEDULED"] } },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, title: true, status: true, updatedAt: true },
    }),
  ]);

  const stats = [
    { label: "Pages", value: pageCount, href: "/studio/pages" },
    { label: "Published", value: publishedCount, href: "/studio/pages?status=PUBLISHED" },
    { label: "Blog posts", value: postCount, href: "/studio/blog" },
    { label: "Media files", value: mediaCount, href: "/studio/media" },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h2 className="text-lg font-semibold text-ink">
          Welcome back{session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}
        </h2>
        <p className="text-sm text-muted">Here is what is happening on your site.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="transition-colors hover:border-brand/40">
              <CardContent className="p-4">
                <p className="text-2xl font-semibold text-ink">{stat.value}</p>
                <p className="text-sm text-muted">{stat.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent edits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {recentRevisions.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">
                No edits yet. Create your first page to get started.
              </p>
            ) : (
              recentRevisions.map((revision) => (
                <Link
                  key={revision.id}
                  href={`/studio/pages/${revision.page.id}/builder`}
                  className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-app"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{revision.page.title}</p>
                    <p className="truncate font-mono text-xs text-muted">{revision.page.path}</p>
                  </div>
                  <p className="shrink-0 text-xs text-muted">
                    {revision.author?.name ? `${revision.author.name} · ` : ""}
                    {timeAgo(revision.createdAt)}
                  </p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Blog drafts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {draftPosts.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">No drafts in progress.</p>
            ) : (
              draftPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/studio/blog/${post.id}`}
                  className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-app"
                >
                  <p className="truncate text-sm font-medium text-ink">{post.title}</p>
                  <Badge variant={post.status === "SCHEDULED" ? "info" : "warning"}>{post.status.toLowerCase()}</Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudioDashboard;
