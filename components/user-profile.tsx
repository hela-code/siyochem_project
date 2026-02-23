"use client";

import { useAuth } from "@/lib/auth-context";
import DataStore from "@/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function UserProfile() {
  const { user } = useAuth();

  if (!user) return null;

  const userPosts = DataStore.getPostsByUser(user.id);
  const totalLikes = userPosts.reduce((sum, post) => sum + post.likes, 0);
  const allPosts = DataStore.getAllPosts();
  const userPostIds = new Set(userPosts.map((p) => p.id));
  const likedPosts = allPosts.filter((p) => p.likedBy.includes(user.id));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground">{user.email}</p>
              <p className="text-sm mt-1">
                <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                  {user.role === "student" ? "Student" : "Teacher"}
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-primary">{userPosts.length}</p>
            <p className="text-sm text-muted-foreground">Posts Created</p>
          </CardContent>
        </Card>
        <Card className="bg-accent/5 border-accent/20">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-accent">{totalLikes}</p>
            <p className="text-sm text-muted-foreground">Likes Received</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary/5 border-secondary/20">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">{likedPosts.length}</p>
            <p className="text-sm text-muted-foreground">Posts Liked</p>
          </CardContent>
        </Card>
      </div>

      {/* Your Posts */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-primary">Your Posts ({userPosts.length})</h2>

        {userPosts.length === 0 ? (
          <Card className="bg-muted/50">
            <CardContent className="pt-6 text-center text-muted-foreground">
              You haven't created any posts yet. Start sharing your ideas!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {userPosts.map((post) => {
              const topic = DataStore.getTopicById(post.topicId);
              return (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-base">{post.title}</CardTitle>
                    <CardDescription>
                      {topic?.name} • {new Date(post.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-foreground line-clamp-2">{post.content}</p>
                    <div className="flex gap-4 text-sm">
                      <span className="text-muted-foreground">👍 {post.likes} likes</span>
                      <span className="text-muted-foreground">💬 {post.comments.length} comments</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Joined Date */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6 text-center text-sm text-muted-foreground">
          Member since {new Date(user.createdAt).toLocaleDateString()}
        </CardContent>
      </Card>
    </div>
  );
}
