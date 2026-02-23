"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import DataStore, { Post, Topic } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SocialFeed() {
  const { user } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [showNewPost, setShowNewPost] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicDesc, setNewTopicDesc] = useState("");
  const [showNewTopic, setShowNewTopic] = useState(false);

  useEffect(() => {
    loadTopicsAndPosts();
  }, []);

  useEffect(() => {
    if (selectedTopic) {
      const topicPosts = DataStore.getPostsByTopic(selectedTopic);
      setPosts(topicPosts);
    } else {
      setPosts(DataStore.getAllPosts());
    }
  }, [selectedTopic]);

  const loadTopicsAndPosts = () => {
    let loadedTopics = DataStore.getAllTopics();
    if (loadedTopics.length === 0) {
      // Create default topics
      const defaultTopics = [
        {
          name: "Organic Chemistry",
          description: "Discuss organic compounds, reactions, and mechanisms",
        },
        {
          name: "Inorganic Chemistry",
          description: "Explore periodic table, bonding, and coordination compounds",
        },
        {
          name: "Physical Chemistry",
          description: "Thermodynamics, kinetics, equilibrium, and electrochemistry",
        },
        {
          name: "Analytical Chemistry",
          description: "Quantitative and qualitative analysis techniques",
        },
        {
          name: "General Discussion",
          description: "Any chemistry-related topics and study tips",
        },
      ];

      defaultTopics.forEach((t) => {
        DataStore.createTopic(t.name, t.description);
      });
      loadedTopics = DataStore.getAllTopics();
    }

    setTopics(loadedTopics);
    if (loadedTopics.length > 0 && !selectedTopic) {
      setSelectedTopic(loadedTopics[0].id);
    }
  };

  const handleCreateTopic = () => {
    if (newTopicName.trim()) {
      DataStore.createTopic(newTopicName, newTopicDesc);
      loadTopicsAndPosts();
      setNewTopicName("");
      setNewTopicDesc("");
      setShowNewTopic(false);
    }
  };

  const handleCreatePost = () => {
    if (!user || !selectedTopic || !title.trim() || !content.trim()) {
      return;
    }

    DataStore.createPost(user.id, selectedTopic, title, content);
    const topicPosts = DataStore.getPostsByTopic(selectedTopic);
    setPosts(topicPosts);
    setTitle("");
    setContent("");
    setShowNewPost(false);
  };

  const handleLikePost = (postId: string) => {
    if (!user) return;

    const post = DataStore.getPostById(postId);
    if (!post) return;

    if (post.likedBy.includes(user.id)) {
      DataStore.unlikePost(postId, user.id);
    } else {
      DataStore.likePost(postId, user.id);
    }

    const topicPosts = DataStore.getPostsByTopic(selectedTopic);
    setPosts(topicPosts);
  };

  const handleAddComment = (postId: string, commentText: string) => {
    if (!user || !commentText.trim()) return;

    DataStore.addComment(postId, user.id, commentText);
    const topicPosts = DataStore.getPostsByTopic(selectedTopic);
    setPosts(topicPosts);
  };

  const handleSharePost = (post: Post) => {
    const text = `Check out this discussion: "${post.title}" on Chemistry A/L Hub`;
    const url = window.location.href;

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };

    const platforms = [
      { name: "Facebook", url: shareUrls.facebook },
      { name: "Twitter", url: shareUrls.twitter },
      { name: "WhatsApp", url: shareUrls.whatsapp },
      { name: "LinkedIn", url: shareUrls.linkedin },
    ];

    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    window.open(platform.url, "_blank");
  };

  return (
    <div className="space-y-8 py-6">
      {/* Topics Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Chemistry Topics
            </h2>
            <p className="text-sm text-muted-foreground">Explore discussions across different branches of chemistry</p>
          </div>
          <Button
            onClick={() => setShowNewTopic(!showNewTopic)}
            className="bg-gradient-to-r from-primary to-accent hover:shadow-lg text-primary-foreground font-semibold shadow-md transition-all duration-300 glow-accent-hover"
          >
            {showNewTopic ? "Cancel" : "+ New Topic"}
          </Button>
        </div>

        {showNewTopic && (
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 shadow-lg glow-accent">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Topic Name</label>
                <Input
                  placeholder="e.g., Organic Reactions"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  className="border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Description</label>
                <Textarea
                  placeholder="Describe this topic..."
                  value={newTopicDesc}
                  onChange={(e) => setNewTopicDesc(e.target.value)}
                  className="border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <Button
                onClick={handleCreateTopic}
                className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg font-semibold"
              >
                Create Topic
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic.id)}
              className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 border-2 ${
                selectedTopic === topic.id
                  ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg border-primary/30 glow-accent"
                  : "bg-gradient-to-br from-secondary/20 to-accent/10 text-foreground hover:border-primary/50 border-transparent glow-accent-hover"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm">{topic.name}</span>
                <span className="text-xs opacity-75 ml-2 px-2 py-1 rounded-full bg-primary/20">({topic.postCount})</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* New Post Section */}
      {!showNewPost && (
        <Button
          onClick={() => setShowNewPost(true)}
          className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg h-12 font-semibold text-primary-foreground shadow-md glow-accent-hover"
        >
          ✨ Create New Post
        </Button>
      )}

      {showNewPost && (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 shadow-lg glow-accent">
          <CardHeader className="border-b border-primary/20">
            <CardTitle className="text-xl">Share Your Ideas</CardTitle>
            <CardDescription>Contribute to the chemistry community discussion</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Title</label>
              <Input
                placeholder="What's your topic about?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-medium border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Your Thoughts</label>
              <Textarea
                placeholder="Share your insights, questions, or discoveries..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-32 border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleCreatePost}
                className="flex-1 bg-gradient-to-r from-primary to-accent font-semibold hover:shadow-lg"
              >
                Post
              </Button>
              <Button
                onClick={() => setShowNewPost(false)}
                variant="outline"
                className="flex-1 border-primary/30 hover:bg-primary/10"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts Section */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {selectedTopic
            ? DataStore.getTopicById(selectedTopic)?.name + " Posts"
            : "All Posts"}
        </h3>

        {posts.length === 0 ? (
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 py-12">
            <CardContent className="text-center">
              <p className="text-4xl mb-3">💭</p>
              <p className="text-lg font-semibold text-foreground">No posts yet</p>
              <p className="text-muted-foreground">Be the first to share your ideas with the community!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-5">
            {posts.map((post) => {
              const author = DataStore.getUserById(post.userId);
              const isLiked = user ? post.likedBy.includes(user.id) : false;

              return (
                <Card 
                  key={post.id} 
                  className="hover:shadow-xl transition-all duration-300 border-primary/20 hover:border-primary/40 hover:glow-accent bg-gradient-to-br from-card to-card/80"
                >
                  <CardHeader className="pb-4 border-b border-primary/10">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl font-bold text-foreground">{post.title}</CardTitle>
                        <CardDescription className="mt-2 flex items-center gap-2">
                          <span className="font-semibold text-accent">{author?.name || "Unknown"}</span>
                          <span className="text-xs opacity-60">•</span>
                          <span className="text-xs">{new Date(post.createdAt).toLocaleDateString()}</span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5 pt-6">
                    <p className="text-foreground leading-relaxed">{post.content}</p>

                    <div className="flex flex-wrap gap-3 items-center">
                      <Button
                        onClick={() => handleLikePost(post.id)}
                        className={`font-semibold transition-all duration-300 ${
                          isLiked
                            ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg"
                            : "border border-primary/30 text-foreground hover:bg-primary/10"
                        }`}
                      >
                        {isLiked ? "❤️" : "🤍"} {post.likes}
                      </Button>
                      <Button
                        onClick={() => handleSharePost(post)}
                        className="font-semibold border border-accent/30 text-foreground hover:bg-accent/10 transition-all duration-300"
                      >
                        📤 Share
                      </Button>
                    </div>

                    {/* Comments Section */}
                    <div className="space-y-4 mt-6 pt-4 border-t border-primary/10">
                      <p className="text-sm font-semibold text-foreground">Comments ({post.comments.length})</p>
                      {post.comments.slice(-3).map((comment) => {
                        const commentAuthor = DataStore.getUserById(comment.userId);
                        return (
                          <div
                            key={comment.id}
                            className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-3 text-sm border border-primary/10"
                          >
                            <p className="font-semibold text-primary">{commentAuthor?.name || "Unknown"}</p>
                            <p className="text-muted-foreground mt-1">{comment.content}</p>
                          </div>
                        );
                      })}

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const input = e.currentTarget.elements.namedItem(
                            `comment-${post.id}`
                          ) as HTMLInputElement;
                          handleAddComment(post.id, input.value);
                          input.value = "";
                        }}
                        className="flex gap-2 mt-3"
                      >
                        <Input
                          name={`comment-${post.id}`}
                          placeholder="Share your thoughts..."
                          className="text-sm border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                        <Button type="submit" className="bg-gradient-to-r from-primary to-accent font-semibold">
                          Reply
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
