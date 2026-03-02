(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/Documents/Waruna  Bopitiya/SLIIT/Projects/SiyoProject/siyochem_project/lib/store.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Client-side data store using localStorage
__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
class DataStore {
    static STORAGE_KEY = "chemistry_platform";
    static getStorage() {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : this.getDefaultData();
        } catch  {
            return this.getDefaultData();
        }
    }
    static getDefaultData() {
        return {
            users: [],
            posts: [],
            topics: [],
            quizzes: [],
            studentAnswers: [],
            quizAttempts: [],
            currentUser: null
        };
    }
    static saveStorage(data) {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch  {
            console.error("Failed to save to localStorage");
        }
    }
    // User Management
    static getCurrentUser() {
        const data = this.getStorage();
        return data?.currentUser || null;
    }
    static setCurrentUser(user) {
        const data = this.getStorage();
        data.currentUser = user;
        this.saveStorage(data);
    }
    static registerUser(name, email, role) {
        const data = this.getStorage();
        const user = {
            id: `user_${Date.now()}`,
            name,
            email,
            role,
            createdAt: new Date().toISOString()
        };
        data.users.push(user);
        this.saveStorage(data);
        return user;
    }
    static loginUser(email, role) {
        const data = this.getStorage();
        const user = data.users.find((u)=>u.email === email && u.role === role);
        if (user) {
            this.setCurrentUser(user);
        }
        return user || null;
    }
    static getUserById(id) {
        const data = this.getStorage();
        return data.users.find((u)=>u.id === id) || null;
    }
    static getAllUsers() {
        const data = this.getStorage();
        return data.users;
    }
    // Topic Management
    static getAllTopics() {
        const data = this.getStorage();
        return data.topics;
    }
    static createTopic(name, description) {
        const data = this.getStorage();
        const topic = {
            id: `topic_${Date.now()}`,
            name,
            description,
            postCount: 0,
            createdAt: new Date().toISOString()
        };
        data.topics.push(topic);
        this.saveStorage(data);
        return topic;
    }
    static getTopicById(id) {
        const data = this.getStorage();
        return data.topics.find((t)=>t.id === id) || null;
    }
    // Post Management
    static createPost(userId, topicId, title, content) {
        const data = this.getStorage();
        const post = {
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
            updatedAt: new Date().toISOString()
        };
        data.posts.push(post);
        this.updateTopicPostCount(topicId, 1);
        this.saveStorage(data);
        return post;
    }
    static getPostsByTopic(topicId) {
        const data = this.getStorage();
        return data.posts.filter((p)=>p.topicId === topicId);
    }
    static getPostById(id) {
        const data = this.getStorage();
        return data.posts.find((p)=>p.id === id) || null;
    }
    static likePost(postId, userId) {
        const data = this.getStorage();
        const post = data.posts.find((p)=>p.id === postId);
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
    static unlikePost(postId, userId) {
        const data = this.getStorage();
        const post = data.posts.find((p)=>p.id === postId);
        if (post && post.likedBy.includes(userId)) {
            post.likedBy = post.likedBy.filter((id)=>id !== userId);
            post.likes -= 1;
            this.saveStorage(data);
            return true;
        }
        return false;
    }
    static addComment(postId, userId, content) {
        const data = this.getStorage();
        const post = data.posts.find((p)=>p.id === postId);
        const comment = {
            id: `comment_${Date.now()}`,
            userId,
            postId,
            content,
            createdAt: new Date().toISOString()
        };
        if (post) {
            post.comments.push(comment);
            this.saveStorage(data);
        }
        return comment;
    }
    static getPostsByUser(userId) {
        const data = this.getStorage();
        return data.posts.filter((p)=>p.userId === userId);
    }
    static getAllPosts() {
        const data = this.getStorage();
        return data.posts;
    }
    static updateTopicPostCount(topicId, count) {
        const data = this.getStorage();
        const topic = data.topics.find((t)=>t.id === topicId);
        if (topic) {
            topic.postCount += count;
        }
    }
    // Quiz Management
    static createQuiz(teacherId, title, description, questions, isTimed, timeLimit) {
        const data = this.getStorage();
        const quiz = {
            id: `quiz_${Date.now()}`,
            teacherId,
            title,
            description,
            questions,
            isTimed,
            timeLimit,
            createdAt: new Date().toISOString()
        };
        data.quizzes.push(quiz);
        this.saveStorage(data);
        return quiz;
    }
    static getQuizById(id) {
        const data = this.getStorage();
        return data.quizzes.find((q)=>q.id === id) || null;
    }
    static getQuizzesByTeacher(teacherId) {
        const data = this.getStorage();
        return data.quizzes.filter((q)=>q.teacherId === teacherId);
    }
    static getAllQuizzes() {
        const data = this.getStorage();
        return data.quizzes;
    }
    // Student Answers
    static recordStudentAnswer(answer) {
        const data = this.getStorage();
        data.studentAnswers.push(answer);
        this.saveStorage(data);
    }
    static getStudentAnswersForQuiz(quizId, studentId) {
        const data = this.getStorage();
        return data.studentAnswers.filter((a)=>a.quizId === quizId && a.studentId === studentId);
    }
    // Quiz Attempts
    static recordQuizAttempt(attempt) {
        const data = this.getStorage();
        data.quizAttempts.push(attempt);
        this.saveStorage(data);
    }
    static getQuizAttempts(quizId) {
        const data = this.getStorage();
        return data.quizAttempts.filter((a)=>a.quizId === quizId);
    }
    static getStudentQuizAttempts(quizId, studentId) {
        const data = this.getStorage();
        return data.quizAttempts.filter((a)=>a.quizId === quizId && a.studentId === studentId);
    }
    // Analytics
    static getQuizAnalytics(quizId) {
        const data = this.getStorage();
        const attempts = data.quizAttempts.filter((a)=>a.quizId === quizId);
        if (attempts.length === 0) {
            return {
                totalAttempts: 0,
                averageScore: 0,
                averageTimeSpent: 0,
                questionAnalytics: []
            };
        }
        const quiz = data.quizzes.find((q)=>q.id === quizId);
        const questionAnalytics = quiz.questions.map((q)=>{
            const answers = data.studentAnswers.filter((a)=>a.questionId === q.id && a.quizId === quizId);
            const correctCount = answers.filter((a)=>a.isCorrect).length;
            const avgTime = answers.length > 0 ? answers.reduce((sum, a)=>sum + a.timeSpent, 0) / answers.length : 0;
            return {
                questionId: q.id,
                questionText: q.text,
                totalResponses: answers.length,
                correctCount,
                incorrectCount: answers.length - correctCount,
                correctPercentage: answers.length > 0 ? correctCount / answers.length * 100 : 0,
                averageTimeSpent: avgTime
            };
        });
        return {
            totalAttempts: attempts.length,
            averageScore: attempts.reduce((sum, a)=>sum + a.score, 0) / attempts.length,
            averageTimeSpent: attempts.reduce((sum, a)=>sum + a.timeSpent, 0) / attempts.length,
            questionAnalytics
        };
    }
}
const __TURBOPACK__default__export__ = DataStore;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Documents/Waruna  Bopitiya/SLIIT/Projects/SiyoProject/siyochem_project/lib/auth-context.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Waruna____Bopitiya$2f$SLIIT$2f$Projects$2f$SiyoProject$2f$siyochem_project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Waruna  Bopitiya/SLIIT/Projects/SiyoProject/siyochem_project/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Waruna____Bopitiya$2f$SLIIT$2f$Projects$2f$SiyoProject$2f$siyochem_project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Waruna  Bopitiya/SLIIT/Projects/SiyoProject/siyochem_project/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Waruna____Bopitiya$2f$SLIIT$2f$Projects$2f$SiyoProject$2f$siyochem_project$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Waruna  Bopitiya/SLIIT/Projects/SiyoProject/siyochem_project/lib/store.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Waruna____Bopitiya$2f$SLIIT$2f$Projects$2f$SiyoProject$2f$siyochem_project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function AuthProvider({ children }) {
    _s();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Waruna____Bopitiya$2f$SLIIT$2f$Projects$2f$SiyoProject$2f$siyochem_project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Waruna____Bopitiya$2f$SLIIT$2f$Projects$2f$SiyoProject$2f$siyochem_project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Waruna____Bopitiya$2f$SLIIT$2f$Projects$2f$SiyoProject$2f$siyochem_project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            // Check if user is already logged in
            const currentUser = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Waruna____Bopitiya$2f$SLIIT$2f$Projects$2f$SiyoProject$2f$siyochem_project$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getCurrentUser();
            setUser(currentUser);
            setIsLoading(false);
        }
    }["AuthProvider.useEffect"], []);
    const login = (email, role)=>{
        const loggedInUser = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Waruna____Bopitiya$2f$SLIIT$2f$Projects$2f$SiyoProject$2f$siyochem_project$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].loginUser(email, role);
        if (loggedInUser) {
            setUser(loggedInUser);
            return true;
        }
        return false;
    };
    const register = (name, email, role)=>{
        const newUser = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Waruna____Bopitiya$2f$SLIIT$2f$Projects$2f$SiyoProject$2f$siyochem_project$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].registerUser(name, email, role);
        if (newUser) {
            __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Waruna____Bopitiya$2f$SLIIT$2f$Projects$2f$SiyoProject$2f$siyochem_project$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].setCurrentUser(newUser);
            setUser(newUser);
            return true;
        }
        return false;
    };
    const logout = ()=>{
        __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Waruna____Bopitiya$2f$SLIIT$2f$Projects$2f$SiyoProject$2f$siyochem_project$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].setCurrentUser(null);
        setUser(null);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Waruna____Bopitiya$2f$SLIIT$2f$Projects$2f$SiyoProject$2f$siyochem_project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            isLoading,
            login,
            register,
            logout
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/Documents/Waruna  Bopitiya/SLIIT/Projects/SiyoProject/siyochem_project/lib/auth-context.tsx",
        lineNumber: 56,
        columnNumber: 5
    }, this);
}
_s(AuthProvider, "YajQB7LURzRD+QP5gw0+K2TZIWA=");
_c = AuthProvider;
function useAuth() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Waruna____Bopitiya$2f$SLIIT$2f$Projects$2f$SiyoProject$2f$siyochem_project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}
_s1(useAuth, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Documents/Waruna  Bopitiya/SLIIT/Projects/SiyoProject/siyochem_project/node_modules/next/navigation.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = __turbopack_context__.r("[project]/Documents/Waruna  Bopitiya/SLIIT/Projects/SiyoProject/siyochem_project/node_modules/next/dist/client/components/navigation.js [app-client] (ecmascript)");
}),
"[project]/Documents/Waruna  Bopitiya/SLIIT/Projects/SiyoProject/siyochem_project/node_modules/@vercel/analytics/dist/next/index.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Analytics",
    ()=>Analytics2
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Waruna____Bopitiya$2f$SLIIT$2f$Projects$2f$SiyoProject$2f$siyochem_project$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/Documents/Waruna  Bopitiya/SLIIT/Projects/SiyoProject/siyochem_project/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
// src/nextjs/index.tsx
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Waruna____Bopitiya$2f$SLIIT$2f$Projects$2f$SiyoProject$2f$siyochem_project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Waruna  Bopitiya/SLIIT/Projects/SiyoProject/siyochem_project/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
// src/nextjs/utils.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Waruna____Bopitiya$2f$SLIIT$2f$Projects$2f$SiyoProject$2f$siyochem_project$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/Waruna  Bopitiya/SLIIT/Projects/SiyoProject/siyochem_project/node_modules/next/navigation.js [app-client] (ecmascript)");
"use client";
;
;
// package.json
var name = "@vercel/analytics";
var version = "1.6.1";
// src/queue.ts
var initQueue = ()=>{
    if (window.va) return;
    window.va = function a(...params) {
        (window.vaq = window.vaq || []).push(params);
    };
};
// src/utils.ts
function isBrowser() {
    return typeof window !== "undefined";
}
function detectEnvironment() {
    try {
        const env = ("TURBOPACK compile-time value", "development");
        if ("TURBOPACK compile-time truthy", 1) {
            return "development";
        }
    } catch (e) {}
    return "production";
}
function setMode(mode = "auto") {
    if (mode === "auto") {
        window.vam = detectEnvironment();
        return;
    }
    window.vam = mode;
}
function getMode() {
    const mode = isBrowser() ? window.vam : detectEnvironment();
    return mode || "production";
}
function isDevelopment() {
    return getMode() === "development";
}
function computeRoute(pathname, pathParams) {
    if (!pathname || !pathParams) {
        return pathname;
    }
    let result = pathname;
    try {
        const entries = Object.entries(pathParams);
        for (const [key, value] of entries){
            if (!Array.isArray(value)) {
                const matcher = turnValueToRegExp(value);
                if (matcher.test(result)) {
                    result = result.replace(matcher, `/[${key}]`);
                }
            }
        }
        for (const [key, value] of entries){
            if (Array.isArray(value)) {
                const matcher = turnValueToRegExp(value.join("/"));
                if (matcher.test(result)) {
                    result = result.replace(matcher, `/[...${key}]`);
                }
            }
        }
        return result;
    } catch (e) {
        return pathname;
    }
}
function turnValueToRegExp(value) {
    return new RegExp(`/${escapeRegExp(value)}(?=[/?#]|$)`);
}
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function getScriptSrc(props) {
    if (props.scriptSrc) {
        return props.scriptSrc;
    }
    if (isDevelopment()) {
        return "https://va.vercel-scripts.com/v1/script.debug.js";
    }
    if (props.basePath) {
        return `${props.basePath}/insights/script.js`;
    }
    return "/_vercel/insights/script.js";
}
// src/generic.ts
function inject(props = {
    debug: true
}) {
    var _a;
    if (!isBrowser()) return;
    setMode(props.mode);
    initQueue();
    if (props.beforeSend) {
        (_a = window.va) == null ? void 0 : _a.call(window, "beforeSend", props.beforeSend);
    }
    const src = getScriptSrc(props);
    if (document.head.querySelector(`script[src*="${src}"]`)) return;
    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    script.dataset.sdkn = name + (props.framework ? `/${props.framework}` : "");
    script.dataset.sdkv = version;
    if (props.disableAutoTrack) {
        script.dataset.disableAutoTrack = "1";
    }
    if (props.endpoint) {
        script.dataset.endpoint = props.endpoint;
    } else if (props.basePath) {
        script.dataset.endpoint = `${props.basePath}/insights`;
    }
    if (props.dsn) {
        script.dataset.dsn = props.dsn;
    }
    script.onerror = ()=>{
        const errorMessage = isDevelopment() ? "Please check if any ad blockers are enabled and try again." : "Be sure to enable Web Analytics for your project and deploy again. See https://vercel.com/docs/analytics/quickstart for more information.";
        console.log(`[Vercel Web Analytics] Failed to load script from ${src}. ${errorMessage}`);
    };
    if (isDevelopment() && props.debug === false) {
        script.dataset.debug = "false";
    }
    document.head.appendChild(script);
}
function pageview({ route, path }) {
    var _a;
    (_a = window.va) == null ? void 0 : _a.call(window, "pageview", {
        route,
        path
    });
}
// src/react/utils.ts
function getBasePath() {
    if (typeof __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Waruna____Bopitiya$2f$SLIIT$2f$Projects$2f$SiyoProject$2f$siyochem_project$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"] === "undefined" || typeof __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Waruna____Bopitiya$2f$SLIIT$2f$Projects$2f$SiyoProject$2f$siyochem_project$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env === "undefined") {
        return void 0;
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Waruna____Bopitiya$2f$SLIIT$2f$Projects$2f$SiyoProject$2f$siyochem_project$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.REACT_APP_VERCEL_OBSERVABILITY_BASEPATH;
}
// src/react/index.tsx
function Analytics(props) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Waruna____Bopitiya$2f$SLIIT$2f$Projects$2f$SiyoProject$2f$siyochem_project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Analytics.useEffect": ()=>{
            var _a;
            if (props.beforeSend) {
                (_a = window.va) == null ? void 0 : _a.call(window, "beforeSend", props.beforeSend);
            }
        }
    }["Analytics.useEffect"], [
        props.beforeSend
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Waruna____Bopitiya$2f$SLIIT$2f$Projects$2f$SiyoProject$2f$siyochem_project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Analytics.useEffect": ()=>{
            inject({
                framework: props.framework || "react",
                basePath: props.basePath ?? getBasePath(),
                ...props.route !== void 0 && {
                    disableAutoTrack: true
                },
                ...props
            });
        }
    }["Analytics.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Waruna____Bopitiya$2f$SLIIT$2f$Projects$2f$SiyoProject$2f$siyochem_project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Analytics.useEffect": ()=>{
            if (props.route && props.path) {
                pageview({
                    route: props.route,
                    path: props.path
                });
            }
        }
    }["Analytics.useEffect"], [
        props.route,
        props.path
    ]);
    return null;
}
;
var useRoute = ()=>{
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Waruna____Bopitiya$2f$SLIIT$2f$Projects$2f$SiyoProject$2f$siyochem_project$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Waruna____Bopitiya$2f$SLIIT$2f$Projects$2f$SiyoProject$2f$siyochem_project$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const path = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Waruna____Bopitiya$2f$SLIIT$2f$Projects$2f$SiyoProject$2f$siyochem_project$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    if (!params) {
        return {
            route: null,
            path
        };
    }
    const finalParams = Object.keys(params).length ? params : Object.fromEntries(searchParams.entries());
    return {
        route: computeRoute(path, finalParams),
        path
    };
};
function getBasePath2() {
    if (typeof __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Waruna____Bopitiya$2f$SLIIT$2f$Projects$2f$SiyoProject$2f$siyochem_project$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"] === "undefined" || typeof __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Waruna____Bopitiya$2f$SLIIT$2f$Projects$2f$SiyoProject$2f$siyochem_project$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env === "undefined") {
        return void 0;
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Waruna____Bopitiya$2f$SLIIT$2f$Projects$2f$SiyoProject$2f$siyochem_project$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_VERCEL_OBSERVABILITY_BASEPATH;
}
// src/nextjs/index.tsx
function AnalyticsComponent(props) {
    const { route, path } = useRoute();
    return /* @__PURE__ */ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Waruna____Bopitiya$2f$SLIIT$2f$Projects$2f$SiyoProject$2f$siyochem_project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].createElement(Analytics, {
        path,
        route,
        ...props,
        basePath: getBasePath2(),
        framework: "next"
    });
}
function Analytics2(props) {
    return /* @__PURE__ */ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Waruna____Bopitiya$2f$SLIIT$2f$Projects$2f$SiyoProject$2f$siyochem_project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].createElement(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Waruna____Bopitiya$2f$SLIIT$2f$Projects$2f$SiyoProject$2f$siyochem_project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
        fallback: null
    }, /* @__PURE__ */ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Waruna____Bopitiya$2f$SLIIT$2f$Projects$2f$SiyoProject$2f$siyochem_project$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].createElement(AnalyticsComponent, {
        ...props
    }));
}
;
 //# sourceMappingURL=index.mjs.map
}),
"[project]/Documents/Waruna  Bopitiya/SLIIT/Projects/SiyoProject/siyochem_project/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Waruna____Bopitiya$2f$SLIIT$2f$Projects$2f$SiyoProject$2f$siyochem_project$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/Documents/Waruna  Bopitiya/SLIIT/Projects/SiyoProject/siyochem_project/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
/**
 * @license React
 * react-jsx-dev-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ "use strict";
"production" !== ("TURBOPACK compile-time value", "development") && function() {
    function getComponentNameFromType(type) {
        if (null == type) return null;
        if ("function" === typeof type) return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
        if ("string" === typeof type) return type;
        switch(type){
            case REACT_FRAGMENT_TYPE:
                return "Fragment";
            case REACT_PROFILER_TYPE:
                return "Profiler";
            case REACT_STRICT_MODE_TYPE:
                return "StrictMode";
            case REACT_SUSPENSE_TYPE:
                return "Suspense";
            case REACT_SUSPENSE_LIST_TYPE:
                return "SuspenseList";
            case REACT_ACTIVITY_TYPE:
                return "Activity";
            case REACT_VIEW_TRANSITION_TYPE:
                return "ViewTransition";
        }
        if ("object" === typeof type) switch("number" === typeof type.tag && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), type.$$typeof){
            case REACT_PORTAL_TYPE:
                return "Portal";
            case REACT_CONTEXT_TYPE:
                return type.displayName || "Context";
            case REACT_CONSUMER_TYPE:
                return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
                var innerType = type.render;
                type = type.displayName;
                type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
                return type;
            case REACT_MEMO_TYPE:
                return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
                innerType = type._payload;
                type = type._init;
                try {
                    return getComponentNameFromType(type(innerType));
                } catch (x) {}
        }
        return null;
    }
    function testStringCoercion(value) {
        return "" + value;
    }
    function checkKeyStringCoercion(value) {
        try {
            testStringCoercion(value);
            var JSCompiler_inline_result = !1;
        } catch (e) {
            JSCompiler_inline_result = !0;
        }
        if (JSCompiler_inline_result) {
            JSCompiler_inline_result = console;
            var JSCompiler_temp_const = JSCompiler_inline_result.error;
            var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
            JSCompiler_temp_const.call(JSCompiler_inline_result, "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.", JSCompiler_inline_result$jscomp$0);
            return testStringCoercion(value);
        }
    }
    function getTaskName(type) {
        if (type === REACT_FRAGMENT_TYPE) return "<>";
        if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE) return "<...>";
        try {
            var name = getComponentNameFromType(type);
            return name ? "<" + name + ">" : "<...>";
        } catch (x) {
            return "<...>";
        }
    }
    function getOwner() {
        var dispatcher = ReactSharedInternals.A;
        return null === dispatcher ? null : dispatcher.getOwner();
    }
    function UnknownOwner() {
        return Error("react-stack-top-frame");
    }
    function hasValidKey(config) {
        if (hasOwnProperty.call(config, "key")) {
            var getter = Object.getOwnPropertyDescriptor(config, "key").get;
            if (getter && getter.isReactWarning) return !1;
        }
        return void 0 !== config.key;
    }
    function defineKeyPropWarningGetter(props, displayName) {
        function warnAboutAccessingKey() {
            specialPropKeyWarningShown || (specialPropKeyWarningShown = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", displayName));
        }
        warnAboutAccessingKey.isReactWarning = !0;
        Object.defineProperty(props, "key", {
            get: warnAboutAccessingKey,
            configurable: !0
        });
    }
    function elementRefGetterWithDeprecationWarning() {
        var componentName = getComponentNameFromType(this.type);
        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."));
        componentName = this.props.ref;
        return void 0 !== componentName ? componentName : null;
    }
    function ReactElement(type, key, props, owner, debugStack, debugTask) {
        var refProp = props.ref;
        type = {
            $$typeof: REACT_ELEMENT_TYPE,
            type: type,
            key: key,
            props: props,
            _owner: owner
        };
        null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {
            enumerable: !1,
            get: elementRefGetterWithDeprecationWarning
        }) : Object.defineProperty(type, "ref", {
            enumerable: !1,
            value: null
        });
        type._store = {};
        Object.defineProperty(type._store, "validated", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: 0
        });
        Object.defineProperty(type, "_debugInfo", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: null
        });
        Object.defineProperty(type, "_debugStack", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugStack
        });
        Object.defineProperty(type, "_debugTask", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugTask
        });
        Object.freeze && (Object.freeze(type.props), Object.freeze(type));
        return type;
    }
    function jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStack, debugTask) {
        var children = config.children;
        if (void 0 !== children) if (isStaticChildren) if (isArrayImpl(children)) {
            for(isStaticChildren = 0; isStaticChildren < children.length; isStaticChildren++)validateChildKeys(children[isStaticChildren]);
            Object.freeze && Object.freeze(children);
        } else console.error("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
        else validateChildKeys(children);
        if (hasOwnProperty.call(config, "key")) {
            children = getComponentNameFromType(type);
            var keys = Object.keys(config).filter(function(k) {
                return "key" !== k;
            });
            isStaticChildren = 0 < keys.length ? "{key: someKey, " + keys.join(": ..., ") + ": ...}" : "{key: someKey}";
            didWarnAboutKeySpread[children + isStaticChildren] || (keys = 0 < keys.length ? "{" + keys.join(": ..., ") + ": ...}" : "{}", console.error('A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />', isStaticChildren, children, keys, children), didWarnAboutKeySpread[children + isStaticChildren] = !0);
        }
        children = null;
        void 0 !== maybeKey && (checkKeyStringCoercion(maybeKey), children = "" + maybeKey);
        hasValidKey(config) && (checkKeyStringCoercion(config.key), children = "" + config.key);
        if ("key" in config) {
            maybeKey = {};
            for(var propName in config)"key" !== propName && (maybeKey[propName] = config[propName]);
        } else maybeKey = config;
        children && defineKeyPropWarningGetter(maybeKey, "function" === typeof type ? type.displayName || type.name || "Unknown" : type);
        return ReactElement(type, children, maybeKey, getOwner(), debugStack, debugTask);
    }
    function validateChildKeys(node) {
        isValidElement(node) ? node._store && (node._store.validated = 1) : "object" === typeof node && null !== node && node.$$typeof === REACT_LAZY_TYPE && ("fulfilled" === node._payload.status ? isValidElement(node._payload.value) && node._payload.value._store && (node._payload.value._store.validated = 1) : node._store && (node._store.validated = 1));
    }
    function isValidElement(object) {
        return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
    }
    var React = __turbopack_context__.r("[project]/Documents/Waruna  Bopitiya/SLIIT/Projects/SiyoProject/siyochem_project/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)"), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), REACT_VIEW_TRANSITION_TYPE = Symbol.for("react.view_transition"), REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"), ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, hasOwnProperty = Object.prototype.hasOwnProperty, isArrayImpl = Array.isArray, createTask = console.createTask ? console.createTask : function() {
        return null;
    };
    React = {
        react_stack_bottom_frame: function(callStackForError) {
            return callStackForError();
        }
    };
    var specialPropKeyWarningShown;
    var didWarnAboutElementRef = {};
    var unknownOwnerDebugStack = React.react_stack_bottom_frame.bind(React, UnknownOwner)();
    var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
    var didWarnAboutKeySpread = {};
    exports.Fragment = REACT_FRAGMENT_TYPE;
    exports.jsxDEV = function(type, config, maybeKey, isStaticChildren) {
        var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        if (trackActualOwner) {
            var previousStackTraceLimit = Error.stackTraceLimit;
            Error.stackTraceLimit = 10;
            var debugStackDEV = Error("react-stack-top-frame");
            Error.stackTraceLimit = previousStackTraceLimit;
        } else debugStackDEV = unknownOwnerDebugStack;
        return jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStackDEV, trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask);
    };
}();
}),
"[project]/Documents/Waruna  Bopitiya/SLIIT/Projects/SiyoProject/siyochem_project/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$Waruna____Bopitiya$2f$SLIIT$2f$Projects$2f$SiyoProject$2f$siyochem_project$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/Documents/Waruna  Bopitiya/SLIIT/Projects/SiyoProject/siyochem_project/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
'use strict';
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    module.exports = __turbopack_context__.r("[project]/Documents/Waruna  Bopitiya/SLIIT/Projects/SiyoProject/siyochem_project/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)");
}
}),
]);

//# sourceMappingURL=Documents_Waruna%20%20Bopitiya_SLIIT_Projects_SiyoProject_siyochem_project_e21f6386._.js.map