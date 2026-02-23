// Client-side data store using localStorage
export interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "teacher";
  avatar?: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  topicId: string;
  title: string;
  content: string;
  likes: number;
  likedBy: string[];
  comments: Comment[];
  shares: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  postId: string;
  content: string;
  createdAt: string;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  postCount: number;
  createdAt: string;
}

export interface Quiz {
  id: string;
  teacherId: string;
  title: string;
  description: string;
  questions: Question[];
  isTimed: boolean;
  timeLimit?: number; // in seconds
  createdAt: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOption: number;
  explanation?: string;
}

export interface StudentAnswer {
  id: string;
  quizId: string;
  studentId: string;
  questionId: string;
  selectedOption: number;
  isCorrect: boolean;
  timeSpent: number; // in seconds
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  score: number;
  totalQuestions: number;
  timeSpent: number;
  createdAt: string;
  answers: StudentAnswer[];
}

class DataStore {
  private static STORAGE_KEY = "chemistry_platform";

  private static getStorage() {
    if (typeof window === "undefined") return null;
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : this.getDefaultData();
    } catch {
      return this.getDefaultData();
    }
  }

  private static getDefaultData() {
    return {
      users: [],
      posts: [],
      topics: [],
      quizzes: [],
      studentAnswers: [],
      quizAttempts: [],
      currentUser: null,
    };
  }

  private static saveStorage(data: any) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch {
      console.error("Failed to save to localStorage");
    }
  }

  // User Management
  static getCurrentUser(): User | null {
    const data = this.getStorage();
    return data?.currentUser || null;
  }

  static setCurrentUser(user: User | null) {
    const data = this.getStorage();
    data.currentUser = user;
    this.saveStorage(data);
  }

  static registerUser(
    name: string,
    email: string,
    role: "student" | "teacher"
  ): User {
    const data = this.getStorage();
    const user: User = {
      id: `user_${Date.now()}`,
      name,
      email,
      role,
      createdAt: new Date().toISOString(),
    };
    data.users.push(user);
    this.saveStorage(data);
    return user;
  }

  static loginUser(email: string, role: "student" | "teacher"): User | null {
    const data = this.getStorage();
    const user = data.users.find(
      (u: User) => u.email === email && u.role === role
    );
    if (user) {
      this.setCurrentUser(user);
    }
    return user || null;
  }

  static getUserById(id: string): User | null {
    const data = this.getStorage();
    return data.users.find((u: User) => u.id === id) || null;
  }

  static getAllUsers(): User[] {
    const data = this.getStorage();
    return data.users;
  }

  // Topic Management
  static getAllTopics(): Topic[] {
    const data = this.getStorage();
    return data.topics;
  }

  static createTopic(name: string, description: string): Topic {
    const data = this.getStorage();
    const topic: Topic = {
      id: `topic_${Date.now()}`,
      name,
      description,
      postCount: 0,
      createdAt: new Date().toISOString(),
    };
    data.topics.push(topic);
    this.saveStorage(data);
    return topic;
  }

  static getTopicById(id: string): Topic | null {
    const data = this.getStorage();
    return data.topics.find((t: Topic) => t.id === id) || null;
  }

  // Post Management
  static createPost(
    userId: string,
    topicId: string,
    title: string,
    content: string
  ): Post {
    const data = this.getStorage();
    const post: Post = {
      id: `post_${Date.now()}`,
      userId,
      topicId,
      title,
      content,
      likes: 0,
      likedBy: [],
      comments: [],
      shares: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.posts.push(post);
    this.updateTopicPostCount(topicId, 1);
    this.saveStorage(data);
    return post;
  }

  static getPostsByTopic(topicId: string): Post[] {
    const data = this.getStorage();
    return data.posts.filter((p: Post) => p.topicId === topicId);
  }

  static getPostById(id: string): Post | null {
    const data = this.getStorage();
    return data.posts.find((p: Post) => p.id === id) || null;
  }

  static likePost(postId: string, userId: string): boolean {
    const data = this.getStorage();
    const post = data.posts.find((p: Post) => p.id === postId);
    if (post) {
      if (!post.likedBy.includes(userId)) {
        post.likedBy.push(userId);
        post.likes += 1;
        this.saveStorage(data);
        return true;
      }
      return false;
    }
    return false;
  }

  static unlikePost(postId: string, userId: string): boolean {
    const data = this.getStorage();
    const post = data.posts.find((p: Post) => p.id === postId);
    if (post && post.likedBy.includes(userId)) {
      post.likedBy = post.likedBy.filter((id: string) => id !== userId);
      post.likes -= 1;
      this.saveStorage(data);
      return true;
    }
    return false;
  }

  static addComment(postId: string, userId: string, content: string): Comment {
    const data = this.getStorage();
    const post = data.posts.find((p: Post) => p.id === postId);
    const comment: Comment = {
      id: `comment_${Date.now()}`,
      userId,
      postId,
      content,
      createdAt: new Date().toISOString(),
    };
    if (post) {
      post.comments.push(comment);
      this.saveStorage(data);
    }
    return comment;
  }

  static getPostsByUser(userId: string): Post[] {
    const data = this.getStorage();
    return data.posts.filter((p: Post) => p.userId === userId);
  }

  static getAllPosts(): Post[] {
    const data = this.getStorage();
    return data.posts;
  }

  private static updateTopicPostCount(topicId: string, count: number) {
    const data = this.getStorage();
    const topic = data.topics.find((t: Topic) => t.id === topicId);
    if (topic) {
      topic.postCount += count;
    }
  }

  // Quiz Management
  static createQuiz(
    teacherId: string,
    title: string,
    description: string,
    questions: Question[],
    isTimed: boolean,
    timeLimit?: number
  ): Quiz {
    const data = this.getStorage();
    const quiz: Quiz = {
      id: `quiz_${Date.now()}`,
      teacherId,
      title,
      description,
      questions,
      isTimed,
      timeLimit,
      createdAt: new Date().toISOString(),
    };
    data.quizzes.push(quiz);
    this.saveStorage(data);
    return quiz;
  }

  static getQuizById(id: string): Quiz | null {
    const data = this.getStorage();
    return data.quizzes.find((q: Quiz) => q.id === id) || null;
  }

  static getQuizzesByTeacher(teacherId: string): Quiz[] {
    const data = this.getStorage();
    return data.quizzes.filter((q: Quiz) => q.teacherId === teacherId);
  }

  static getAllQuizzes(): Quiz[] {
    const data = this.getStorage();
    return data.quizzes;
  }

  // Student Answers
  static recordStudentAnswer(answer: StudentAnswer) {
    const data = this.getStorage();
    data.studentAnswers.push(answer);
    this.saveStorage(data);
  }

  static getStudentAnswersForQuiz(
    quizId: string,
    studentId: string
  ): StudentAnswer[] {
    const data = this.getStorage();
    return data.studentAnswers.filter(
      (a: StudentAnswer) => a.quizId === quizId && a.studentId === studentId
    );
  }

  // Quiz Attempts
  static recordQuizAttempt(attempt: QuizAttempt) {
    const data = this.getStorage();
    data.quizAttempts.push(attempt);
    this.saveStorage(data);
  }

  static getQuizAttempts(quizId: string): QuizAttempt[] {
    const data = this.getStorage();
    return data.quizAttempts.filter((a: QuizAttempt) => a.quizId === quizId);
  }

  static getStudentQuizAttempts(
    quizId: string,
    studentId: string
  ): QuizAttempt[] {
    const data = this.getStorage();
    return data.quizAttempts.filter(
      (a: QuizAttempt) => a.quizId === quizId && a.studentId === studentId
    );
  }

  // Analytics
  static getQuizAnalytics(quizId: string) {
    const data = this.getStorage();
    const attempts = data.quizAttempts.filter(
      (a: QuizAttempt) => a.quizId === quizId
    );

    if (attempts.length === 0) {
      return {
        totalAttempts: 0,
        averageScore: 0,
        averageTimeSpent: 0,
        questionAnalytics: [],
      };
    }

    const quiz = data.quizzes.find((q: Quiz) => q.id === quizId);
    const questionAnalytics = quiz.questions.map((q: Question) => {
      const answers = data.studentAnswers.filter(
        (a: StudentAnswer) => a.questionId === q.id && a.quizId === quizId
      );
      const correctCount = answers.filter(
        (a: StudentAnswer) => a.isCorrect
      ).length;
      const avgTime =
        answers.length > 0
          ? answers.reduce((sum: number, a: StudentAnswer) => sum + a.timeSpent, 0) /
            answers.length
          : 0;

      return {
        questionId: q.id,
        questionText: q.text,
        totalResponses: answers.length,
        correctCount,
        incorrectCount: answers.length - correctCount,
        correctPercentage:
          answers.length > 0
            ? (correctCount / answers.length) * 100
            : 0,
        averageTimeSpent: avgTime,
      };
    });

    return {
      totalAttempts: attempts.length,
      averageScore:
        attempts.reduce((sum: number, a: QuizAttempt) => sum + a.score, 0) /
        attempts.length,
      averageTimeSpent:
        attempts.reduce((sum: number, a: QuizAttempt) => sum + a.timeSpent, 0) /
        attempts.length,
      questionAnalytics,
    };
  }
}

export default DataStore;
