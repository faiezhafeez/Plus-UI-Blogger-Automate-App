/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { Blog, BlogPost } from './types';
import {
  initAuth,
  googleSignIn,
  logout as fbLogout,
} from './firebase';
import {
  fetchUserBlogs,
  fetchBlogPosts,
  createBlogPost,
  updateBlogPost,
  publishBlogPost,
  revertBlogPost,
  deleteBlogPost
} from './bloggerApi';
import BlogSelector from './components/BlogSelector';
import PostList from './components/PostList';
import PostDetail from './components/PostDetail';
import PostEditor from './components/PostEditor';
import { CompileParams, compileXmlTemplate } from './data/xmlTemplate';
import {
  Rss,
  LogOut,
  Sparkles,
  BookOpen,
  ArrowRight,
  TrendingUp,
  FileText,
  Clock,
  CheckCircle,
  HelpCircle,
  Loader2,
  X,
  Plus,
  Sliders,
  Download,
  Copy,
  Check,
  RotateCcw,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  MessageSquare,
  Award,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Send,
  ThumbsUp,
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Blogger Data States
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'draft' | 'scheduled'>('all');

  const [isLoadingBlogs, setIsLoadingBlogs] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [blogsError, setBlogsError] = useState<string | null>(null);

  // App Workspace State: 'console' | 'customizer' | 'xml-exporter'
  const [activeTab, setActiveTab] = useState<'console' | 'customizer' | 'xml-exporter'>('customizer');

  // Theme Customizer States
  const [themeParams, setThemeParams] = useState<CompileParams>({
    statusLight: '#1e3c72',
    statusDark: '#1a1a1a',
    themeColor: '#1e3c72',
    metaKeywords: 'aiou solved assignments, guess papers, past papers, textbooks, b.ed assignments 2026',
    metaIcon: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgb_ryp3yI-Vua7y-bJaZZeRGWDY_pZUXWl5SnGtRrrLPhSVW4-KhLxEClyMqStVRw3ltR8KtS9FyAVNEoZUyFbCobvSmzthXV1vG0VMgv-uxCx3yGrA0d4mOK-1YwJ7v0P_UWb-Di26gk7Wj4MMVr1NCiUIjR6TO7rZnLWI8B5LgS7RARhnQ-0J2pzMFb7/s0/favicon.png',
    metaImage: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiXcTftM-dWwVR9KOkc8PzPng9FbMz-KC083W_hWFV2t2LA10-l0BtsfTj3J3WL2TrClC8aohb-H2Qn_W2DylQ7R11V71k2SGozHBnjSNAKLEUbKzLW4ALsYwMEjcEGSCIyfGLQwERqsQRFlnTv0wm8M0CkGroeYzpKJ_ZPC6_diPbuINzcP075OzTcF7I/s0/meta-image.png',
    homeTitle: 'AssignmentWaly | Allama Iqbal Open University Solved Assignments',
    hometitleStatus: '2px',
    disqusShortname: 'assignmentwaly-1',
    analyticsCode: 'G-AIOU2026',
    safelinkPage1: '/p/safelink-page-1.html',
    studentsHelped: 8247,
    assignmentsSolved: 15632,
    satisfactionRate: 98,
    deadlineDate: '2026-07-15',
    whatsappLink: 'https://wa.me/923702388998?text=AssalamoAlaikum!%20I%20need%20help%20with%20AIOU'
  });

  // Simulator Device View Mode: 'mobile' | 'desktop'
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'desktop'>('mobile');
  // Simulator Dark Mode toggle
  const [simDarkMode, setSimDarkMode] = useState<boolean>(false);
  // Simulator scroll position state (for progress bar)
  const [simScrollPercent, setSimScrollPercent] = useState<number>(0);
  const simulatorContentRef = useRef<HTMLDivElement>(null);

  // Active Review Index in the carousel
  const [activeReviewIndex, setActiveReviewIndex] = useState<number>(0);

  // Countdown timer state values
  const [countdownStr, setCountdownStr] = useState<string>('--d --h --m --s');

  // Copy success indicator
  const [copiedXML, setCopiedXML] = useState<boolean>(false);

  // Post Editor State
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  // Toast / Notifications State
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Preset Theme Colors Mapping
  const themePresets = [
    { name: 'Plus Navy (Default)', color: '#1e3c72', text: 'text-[#1e3c72]' },
    { name: 'Plus Indigo', color: '#482dff', text: 'text-[#482dff]' },
    { name: 'AIOU Gold', color: '#f5b042', text: 'text-[#f5b042]' },
    { name: 'Emerald', color: '#137333', text: 'text-[#137333]' },
    { name: 'Crimson', color: '#be2e3c', text: 'text-[#be2e3c]' }
  ];

  const reviewCollection = [
    { name: "Ali Raza", course: "B.A (1423)", stars: 5, text: "Assignmentwaly ki wajah se maine 1423 aur 247 assignments time pe submit kar di. Guess papers bilkul match aaye. Thank you!", date: "March 2026" },
    { name: "Hina Noor", course: "B.Ed (8608)", stars: 5, text: "8608 workshop report ka sample aur solved contents mujhe yahan mila. Bohat acha format tha, tutor ne full marks diye. Highly recommended.", date: "2 weeks ago" },
    { name: "Usman Ghani", course: "M.Sc (5403)", stars: 5, text: "5403 ki solved assignment ne exam preparation bohat easy aur hassle-free kar di. Appreciate the high quality PDFs.", date: "Jan 2026" },
    { name: "Sadia Batool", course: "FA (247)", stars: 5, text: "247 assignments files ne meri 50% confusion door kar di. Trend analysis and notes are exceptionally clear and accurate.", date: "Feb 2026" }
  ];

  // Auto Tick Countdown to simulated July Spring Deadline / Custom dates
  useEffect(() => {
    const timer = setInterval(() => {
      const deadline = new Date(themeParams.deadlineDate + 'T23:59:00');
      const now = new Date();
      const diff = deadline.getTime() - now.getTime();
      if (diff <= 0) {
        setCountdownStr('Deadline Passed');
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (86400000)) / (3600000));
      const minutes = Math.floor((diff % 3650000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setCountdownStr(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, [themeParams.deadlineDate]);

  // Handle local mockup device scrolling to set scroll indicator
  const handleSimulatorScroll = () => {
    if (simulatorContentRef.current) {
      const el = simulatorContentRef.current;
      const total = el.scrollHeight - el.clientHeight;
      if (total > 0) {
        setSimScrollPercent((el.scrollTop / total) * 100);
      }
    }
  };

  // Triggering XML Code Copy to Clipboard
  const handleCopyXML = () => {
    const fullyCompiledXML = compileXmlTemplate(themeParams);
    navigator.clipboard.writeText(fullyCompiledXML).then(() => {
      setCopiedXML(true);
      showNotification('success', 'Customized XML Theme copied to clipboard!');
      setTimeout(() => setCopiedXML(false), 2000);
    });
  };

  // Triggering XML Theme Download as File
  const handleDownloadXML = () => {
    const fullyCompiledXML = compileXmlTemplate(themeParams);
    const blob = new Blob([fullyCompiledXML], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'PlusUI-AIOU-Customized.xml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotification('success', 'Blogger Theme XML file downloaded successfully!');
  };

  // Auto Dismiss Toast in 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
  };

  // Initialize Auth on App Load
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, cachedToken) => {
        setUser(currentUser);
        setToken(cachedToken);
        setNeedsAuth(false);
        loadBlogs(cachedToken);
      },
      () => {
        setUser(null);
        setToken(null);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch blogs when user is authenticated
  const loadBlogs = async (accessToken: string) => {
    setIsLoadingBlogs(true);
    setBlogsError(null);
    try {
      const fetchedBlogs = await fetchUserBlogs(accessToken);
      setBlogs(fetchedBlogs);
      if (fetchedBlogs.length > 0) {
        setSelectedBlogId(fetchedBlogs[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load blogs:', err);
      setBlogsError(err.message || 'Failed to retrieve blogs from your account.');
      showNotification('error', err.message || 'Failed to retrieve blogs from your account.');
    } finally {
      setIsLoadingBlogs(false);
    }
  };

  // Fetch posts when selected blog or filter status changes
  useEffect(() => {
    if (selectedBlogId && token) {
      loadPosts(selectedBlogId, token, statusFilter);
    } else {
      setPosts([]);
      setSelectedPostId(null);
    }
  }, [selectedBlogId, statusFilter, token]);

  const loadPosts = async (
    blogId: string,
    accessToken: string,
    filter: 'all' | 'live' | 'draft' | 'scheduled'
  ) => {
    setIsLoadingPosts(true);
    try {
      const fetchedPosts = await fetchBlogPosts(blogId, accessToken, filter);
      setPosts(fetchedPosts);
      if (fetchedPosts.length > 0) {
        setSelectedPostId(fetchedPosts[0].id || null);
      } else {
        setSelectedPostId(null);
      }
    } catch (err: any) {
      console.error('Failed to load posts:', err);
      setPosts([]);
      setSelectedPostId(null);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        setNeedsAuth(false);
        showNotification('success', 'Logged in as ' + result.user.displayName);
        loadBlogs(result.accessToken);
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      showNotification('error', err.message || 'Google Sign-In failed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fbLogout();
      setUser(null);
      setToken(null);
      setBlogs([]);
      setPosts([]);
      setSelectedBlogId(null);
      setSelectedPostId(null);
      setNeedsAuth(true);
      showNotification('success', 'Logged out successfully.');
    } catch (err: any) {
      showNotification('error', err.message || 'Logout failed.');
    }
  };

  const handleSavePost = async (
    title: string,
    content: string,
    labels: string[],
    isDraft?: boolean
  ) => {
    if (!selectedBlogId || !token) return;
    setIsActionLoading(true);
    try {
      if (editingPost && editingPost.id) {
        const confirmed = window.confirm(`Update "${title}"?`);
        if (!confirmed) return;

        const updated = await updateBlogPost(selectedBlogId, editingPost.id, token, {
          title,
          content,
          labels,
        });
        setPosts((currentPosts) =>
          currentPosts.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
        );
        setSelectedPostId(updated.id || null);
        showNotification('success', 'Post updated successfully!');
      } else {
        const created = await createBlogPost(
          selectedBlogId,
          token,
          { title, content, labels },
          isDraft ?? true
        );
        setPosts((currentPosts) => [created, ...currentPosts]);
        setSelectedPostId(created.id || null);
        showNotification('success', `Draft "${created.title}" saved successfully!`);
      }
      setShowEditor(false);
      setEditingPost(null);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to save post.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeletePost = async (post: BlogPost) => {
    if (!selectedBlogId || !token || !post.id) return;
    const confirmed = window.confirm(`Delete post "${post.title}" permanently?`);
    if (!confirmed) return;

    setIsActionLoading(true);
    try {
      await deleteBlogPost(selectedBlogId, post.id, token);
      setPosts((currentPosts) => currentPosts.filter((p) => p.id !== post.id));
      setSelectedPostId(null);
      showNotification('success', `Post deleted of Blogger.`);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to delete.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Publish Draft Post Handler
  const handlePublishPost = async (post: BlogPost) => {
    if (!selectedBlogId || !token || !post.id) return;

    // Confirmation dialog before mutating data (MANDATORY per workspace instructions)
    const confirmed = window.confirm(`Are you sure you want to publish the draft "${post.title}" immediately to your public blog?`);
    if (!confirmed) return;

    setIsActionLoading(true);
    try {
      const published = await publishBlogPost(selectedBlogId, post.id, token);
      setPosts((currentPosts) =>
        currentPosts.map((p) => (p.id === published.id ? { ...p, ...published } : p))
      );
      showNotification('success', `Post "${post.title}" is now published and live!`);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to publish post.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Revert Published Post to Draft Handler
  const handleRevertPost = async (post: BlogPost) => {
    if (!selectedBlogId || !token || !post.id) return;

    // Confirmation dialog before mutating data (MANDATORY per workspace instructions)
    const confirmed = window.confirm(`Move published post "${post.title}" back to drafts? This will make the post offline and invisible to public readers.`);
    if (!confirmed) return;

    setIsActionLoading(true);
    try {
      const reverted = await revertBlogPost(selectedBlogId, post.id, token);
      setPosts((currentPosts) =>
        currentPosts.map((p) => (p.id === reverted.id ? { ...p, ...reverted } : p))
      );
      showNotification('success', `Post "${post.title}" is now reverted back to Draft status.`);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to revert post.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const selectedBlog = blogs.find((b) => b.id === selectedBlogId) || null;
  const selectedPost = posts.find((p) => p.id === selectedPostId) || null;

  // Render sign in screen if authentication is incomplete
  if (needsAuth) {
    return (
      <div 
        id="login-landing-container"
        className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 py-12 text-slate-100 font-sans relative overflow-hidden"
      >
        {/* Abstract Backdrop Blobs to recreate high-end UI look */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-blue-500/10 blur-[120px]" />

        <div className="w-full max-w-xl bg-slate-800/80 backdrop-blur-md rounded-3xl border border-slate-700/60 shadow-2xl p-8 sm:p-12 space-y-8 flex flex-col items-center justify-center text-center animate-fade-in">
          
          <div className="relative p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0 shadow-inner">
            <Rss size={48} className="animate-pulse" />
            <div className="absolute -top-1.5 -right-1.5 p-1 bg-amber-500 rounded-full text-slate-950 shadow-md">
              <Sparkles size={12} />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Plus UI <span className="bg-linear-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Theme Studio</span>
            </h1>
            <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-md mx-auto">
              Inspect, customize, and export premium Blogger theme setups instantly. Real team metrics, customizable bento-widgets, safeLink handlers, and active Google account synchronization.
            </p>
          </div>

          {/* Core Feature Highlights */}
          <div className="w-full bg-slate-800/50 border border-slate-700/40 rounded-2xl p-6 text-left space-y-4">
            <div className="flex gap-4 items-start">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
                <Sliders size={18} />
              </div>
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-slate-200">Real-Time XML Theme Customizer</p>
                <p className="text-slate-400">Parameterize your title, banner keywords, SafeLinks, and analytics variables with instant compile.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
                <Smartphone size={18} />
              </div>
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-slate-200">Interactive Premium Simulator</p>
                <p className="text-slate-400">View responsive previews of the Student Success Dashboard, reviews slider, and trending grids with live progress bar.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                <Download size={18} />
              </div>
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-slate-200">Zero-Hassle Theme Exporter</p>
                <p className="text-slate-400">Download or copy ready-to-upload customized XML template codes for the Blogger console instantly.</p>
              </div>
            </div>
          </div>

          <div className="w-full flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="gsi-material-button w-full sm:w-auto h-12 flex items-center justify-center cursor-pointer disabled:opacity-50 transition-all select-none hover:scale-[1.02]"
            >
              <div className="gsi-material-button-state"></div>
              <div className="gsi-material-button-content-wrapper flex items-center gap-3">
                <div className="gsi-material-button-icon shrink-0">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: "block", width: "18px", height: "18px" }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                </div>
                <span className="gsi-material-button-contents text-sm font-semibold tracking-wide text-gray-700">
                  {isLoggingIn ? 'Connecting Blogger API...' : 'Open with Google Google Account'}
                </span>
              </div>
            </button>

            <button
              onClick={() => setNeedsAuth(false)}
              className="px-6 h-12 rounded-xl border border-slate-700 hover:border-indigo-500 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-all"
            >
              Continue in Setup Studio Mode
            </button>
          </div>
        </div>

        <div className="mt-8 text-[11px] font-mono text-slate-500">
          Google Identity Integration • Secure Persistent Firestore Database
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans flex flex-col text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification Container */}
      {notification && (
        <div
          id="global-toast-notification"
          className={`fixed bottom-6 right-6 z-55 flex items-center justify-between gap-3 px-5 py-3.5 rounded-2xl border shadow-2xl max-w-sm animate-slide-up transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-950/85 border-emerald-500/30 text-emerald-300'
              : 'bg-red-950/85 border-red-500/30 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle size={16} className="text-emerald-400 shrink-0" />
            ) : (
              <X size={16} className="text-red-400 shrink-0" />
            )}
            <span className="text-xs font-semibold">{notification.text}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-200 px-1 py-0.5 rounded-lg hover:bg-white/5"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Main Studio Bar / Header */}
      <header className="bg-slate-900 border-b border-slate-800/80 shrink-0 px-6 py-4 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-md">
        
        {/* Brand Logo Section */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/15 text-indigo-400 rounded-xl border border-indigo-500/20">
            <Rss size={22} className="animate-spin-slow" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white block uppercase leading-none">
              Plus UI blogger manager
            </span>
            <span className="text-[10px] text-indigo-400 font-mono tracking-widest uppercase">
              Bento Customization & Analytics Studio
            </span>
          </div>
        </div>

        {/* Global Navigation Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/90 text-xs font-semibold scrollbar-none">
          <button
            onClick={() => setActiveTab('customizer')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all ${
              activeTab === 'customizer'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders size={14} />
            <span>Theme Customizer</span>
          </button>
          
          <button
            onClick={() => setActiveTab('xml-exporter')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all ${
              activeTab === 'xml-exporter'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download size={14} />
            <span>XML Template Builder</span>
          </button>

          <button
            onClick={() => setActiveTab('console')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all ${
              activeTab === 'console'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText size={14} />
            <span>Post Manager Console</span>
          </button>
        </div>

        {/* User profile & Login status */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end leading-none">
                <span className="text-xs font-bold text-slate-100">{user.displayName}</span>
                <span className="text-[9px] text-slate-500 font-mono mt-1">{user.email}</span>
              </div>
              
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'photo'}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full border border-slate-700 object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-sm text-white">
                  {user.displayName?.charAt(0) || 'U'}
                </div>
              )}

              <button
                onClick={handleLogout}
                className="p-2 sm:px-3 rounded-lg bg-slate-950 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/20 transition-all flex items-center gap-1.5"
                title="Log out of Blogger"
              >
                <LogOut size={14} />
                <span className="hidden md:inline text-[11px] font-bold">Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-xs font-bold transition-all shadow-md shadow-indigo-900/40"
            >
              Sync Google Blog
            </button>
          )}
        </div>
      </header>

      {/* Main Studio Viewport */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {/* ================================== TAB 1: MAIN MANAGER CONSOLE ================================== */}
        {activeTab === 'console' && (
          <div className="flex-1 flex overflow-hidden bg-slate-950 p-6 gap-6">
            
            {/* Console Panel 1: Blog Selection & Info */}
            <div className="w-[320px] shrink-0 flex flex-col gap-6 overflow-y-auto">
              <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-5 space-y-4">
                <BlogSelector
                  blogs={blogs}
                  selectedBlogId={selectedBlogId}
                  onSelectBlog={setSelectedBlogId}
                  isLoading={isLoadingBlogs}
                  blogsError={blogsError}
                  onRetry={() => token && loadBlogs(token)}
                />
              </div>

              {selectedBlog && (
                <div className="bg-linear-to-br from-indigo-950 to-indigo-900 rounded-2xl border border-indigo-500/20 p-5 text-slate-100 shadow-lg space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest block mb-1">
                      Active Blog Sync
                    </span>
                    <h3 className="text-lg font-bold tracking-tight leading-snug">
                      {selectedBlog.name}
                    </h3>
                    {selectedBlog.locale && (
                      <span className="text-[10px] font-mono text-indigo-300 bg-white/5 py-0.5 px-2 rounded-md mt-1.5 inline-block border border-indigo-500/20">
                        Locale: {selectedBlog.locale.language.toUpperCase()}-{selectedBlog.locale.country.toUpperCase()}
                      </span>
                    )}
                  </div>

                  {selectedBlog.description && (
                    <p className="text-xs text-slate-300/90 leading-relaxed italic border-t border-slate-700/60 pt-3">
                      "{selectedBlog.description}"
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-700/60 mt-1">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                      <span className="text-[10px] text-indigo-300 block font-semibold">Total Posts</span>
                      <span className="text-xl font-bold block mt-0.5">{selectedBlog.posts?.totalItems || 0}</span>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                      <span className="text-[10px] text-indigo-300 block font-semibold">Pages count</span>
                      <span className="text-xl font-bold block mt-0.5">{selectedBlog.pages?.totalItems || 0}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-5 text-xs text-slate-400 space-y-3 mt-auto">
                <div className="flex gap-2 items-center font-semibold text-slate-200">
                  <HelpCircle size={14} className="text-indigo-400" />
                  <span>How publishing works</span>
                </div>
                <ul className="list-disc list-inside space-y-1.5 text-[11px] leading-relaxed">
                  <li>"Draft" posts are stored offline in Blogger.</li>
                  <li>"Live" posts are visible instantly to everyone.</li>
                  <li>You can turn any live post back to a draft by selecting "Revert to Draft".</li>
                </ul>
              </div>
            </div>

            {/* Console Panel 2: Posts Listing Index */}
            <div className="w-[360px] shrink-0 h-full">
              {selectedBlogId ? (
                <div className="h-full bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden [&>*]:text-slate-100">
                  <PostList
                    posts={posts}
                    selectedPostId={selectedPostId}
                    onSelectPost={(p) => setSelectedPostId(p.id || null)}
                    onNewPost={() => {
                      setEditingPost(null);
                      setShowEditor(true);
                    }}
                    isLoading={isLoadingPosts}
                    onStatusFilterChange={setStatusFilter}
                    currentStatusFilter={statusFilter}
                  />
                </div>
              ) : (
                <div className="h-full bg-slate-900/60 border border-slate-800/80 rounded-2xl flex flex-col justify-center items-center text-center p-6 text-slate-400">
                  <Rss size={28} className="text-slate-600 mb-3" />
                  <p className="font-semibold text-xs text-slate-300 uppercase tracking-widest mb-1">
                    Select a Blog
                  </p>
                  <p className="text-xs text-slate-500 max-w-[200px] leading-relaxed">
                    Choose a synced Google Blog from the leftmost sidebar to inspect articles.
                  </p>
                </div>
              )}
            </div>

            {/* Console Panel 3: Article Workspace Detail */}
            <div className="flex-1 h-full min-w-0">
              {selectedPost ? (
                <div className="h-full bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden [&>*]:text-slate-200">
                  <PostDetail
                    post={selectedPost}
                    onEdit={() => {
                      setEditingPost(selectedPost);
                      setShowEditor(true);
                    }}
                    onDelete={() => handleDeletePost(selectedPost)}
                    onPublish={() => handlePublishPost(selectedPost)}
                    onRevert={() => handleRevertPost(selectedPost)}
                    isActionLoading={isActionLoading}
                  />
                </div>
              ) : (
                <div className="h-full bg-slate-900/40 border border-slate-800/60 rounded-2xl flex flex-col items-center justify-center text-center p-8 text-slate-500">
                  <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-2xl text-indigo-400 mb-4 animate-bounce">
                    <BookOpen size={28} />
                  </div>
                  <h3 className="font-bold text-slate-300 text-sm tracking-wide uppercase">
                    No Article Selected
                  </h3>
                  <p className="text-xs text-slate-500 max-w-[280px] leading-relaxed mt-2">
                    Select an article from the browse index inline panel to preview its contents, verify its HTML source code, and run updates.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ================================== TAB 2: THEME CUSTOMIZER & SIMULATOR ================================== */}
        {activeTab === 'customizer' && (
          <div className="flex-1 flex overflow-hidden bg-slate-950 p-6 gap-6">
            
            {/* Customizer Sidebar Form (Left) */}
            <div className="w-[360px] shrink-0 bg-slate-900 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between overflow-y-auto gap-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sliders size={16} className="text-indigo-400" />
                    <span>Template Settings</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Configure layout options and XML variables inside the template model.</p>
                </div>

                {/* Preset Theme Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Quick Color Presets
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {themePresets.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => {
                          setThemeParams({
                            ...themeParams,
                            statusLight: preset.color,
                            themeColor: preset.color
                          });
                          showNotification('success', `Accent changed to ${preset.name}`);
                        }}
                        className="h-8 rounded-lg border border-slate-700 hover:border-slate-500 flex items-center justify-center transition-all relative"
                        style={{ backgroundColor: preset.color }}
                        title={preset.name}
                      >
                        {themeParams.themeColor === preset.color && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                            <Check size={14} className="text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form fields */}
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Blogger Header Title (home.title)
                    </label>
                    <input
                      type="text"
                      value={themeParams.homeTitle}
                      onChange={(e) => setThemeParams({ ...themeParams, homeTitle: e.target.value })}
                      placeholder="e.g. AssignmentWaly | Solved Assignments"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Metadata Keywords */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Keywords Meta Keywords
                    </label>
                    <textarea
                      value={themeParams.metaKeywords}
                      onChange={(e) => setThemeParams({ ...themeParams, metaKeywords: e.target.value })}
                      rows={2}
                      placeholder="comma-separated tags..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>

                  {/* Hex Color inputs */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        Status light
                      </label>
                      <div className="flex gap-2 items-center bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5">
                        <input
                          type="color"
                          value={themeParams.statusLight}
                          onChange={(e) => setThemeParams({ ...themeParams, statusLight: e.target.value, themeColor: e.target.value })}
                          className="w-5 h-5 rounded-md border border-slate-700 bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={themeParams.statusLight}
                          onChange={(e) => setThemeParams({ ...themeParams, statusLight: e.target.value, themeColor: e.target.value })}
                          className="w-full bg-transparent text-slate-200 text-xs focus:outline-none uppercase"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        status dark
                      </label>
                      <div className="flex gap-2 items-center bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5">
                        <input
                          type="color"
                          value={themeParams.statusDark}
                          onChange={(e) => setThemeParams({ ...themeParams, statusDark: e.target.value })}
                          className="w-5 h-5 rounded-md border border-slate-700 bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={themeParams.statusDark}
                          onChange={(e) => setThemeParams({ ...themeParams, statusDark: e.target.value })}
                          className="w-full bg-transparent text-slate-200 text-xs focus:outline-none uppercase"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Analytics Code & Disqus */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        analytics ID
                      </label>
                      <input
                        type="text"
                        value={themeParams.analyticsCode}
                        onChange={(e) => setThemeParams({ ...themeParams, analyticsCode: e.target.value })}
                        placeholder="e.g. G-XXXX"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        Disqus Short
                      </label>
                      <input
                        type="text"
                        value={themeParams.disqusShortname}
                        onChange={(e) => setThemeParams({ ...themeParams, disqusShortname: e.target.value })}
                        placeholder="disqus-url..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* SafeLink Default & WhatsAppLink */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      whatsapp Direct Link
                    </label>
                    <input
                      type="text"
                      value={themeParams.whatsappLink}
                      onChange={(e) => setThemeParams({ ...themeParams, whatsappLink: e.target.value })}
                      placeholder="https://wa.me/..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Customizable metrics for success dashboard */}
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-4">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                      Success dashboard parameters
                    </span>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-semibold text-slate-450 uppercase tracking-wider mb-1">
                          Helped Students
                        </label>
                        <input
                          type="number"
                          value={themeParams.studentsHelped}
                          onChange={(e) => setThemeParams({ ...themeParams, studentsHelped: Number(e.target.value) })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-semibold text-slate-450 uppercase tracking-wider mb-1">
                          Solved Assignments
                        </label>
                        <input
                          type="number"
                          value={themeParams.assignmentsSolved}
                          onChange={(e) => setThemeParams({ ...themeParams, assignmentsSolved: Number(e.target.value) })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-semibold text-slate-450 uppercase tracking-wider mb-1">
                          Satisfaction %
                        </label>
                        <input
                          type="number"
                          max="100"
                          value={themeParams.satisfactionRate}
                          onChange={(e) => setThemeParams({ ...themeParams, satisfactionRate: Number(e.target.value) })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-semibold text-slate-450 uppercase tracking-wider mb-1">
                          Next Exam Deadline
                        </label>
                        <input
                          type="date"
                          value={themeParams.deadlineDate}
                          onChange={(e) => setThemeParams({ ...themeParams, deadlineDate: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Exporter short CTA inside current customizer */}
              <div className="pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('xml-exporter')}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs font-semibold shadow-md active:translate-y-[1px] transition-all flex items-center justify-center gap-2"
                >
                  <Download size={14} />
                  <span>Compile & Export Theme XML</span>
                </button>
              </div>
            </div>

            {/* Interactive Mockup Preview Sim (Right) */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">
              
              {/* Preview Simulator Control Header */}
              <div className="bg-slate-900 rounded-xl border border-slate-800/80 px-4 py-2.5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-bold text-slate-200">Plus UI Simulator Viewport</span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Dark Mode toggle inside simulator */}
                  <button
                    type="button"
                    onClick={() => {
                      setSimDarkMode(!simDarkMode);
                      showNotification('success', `Simulator dark mode toggled ${!simDarkMode ? 'ON' : 'OFF'}`);
                    }}
                    className={`p-1.5 rounded-lg border transition-all ${
                      simDarkMode 
                        ? 'bg-slate-800 border-indigo-500/35 text-indigo-400' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                    title="Toggle Simulator Light/Dark mode"
                  >
                    {simDarkMode ? <Moon size={14} /> : <Sun size={14} />}
                  </button>

                  <div className="w-[1px] h-4 bg-slate-800" />

                  {/* Device selectors */}
                  <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-850 text-[10px] font-bold">
                    <button
                      onClick={() => setDeviceMode('mobile')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                        deviceMode === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <Smartphone size={11} />
                      <span>Mobile</span>
                    </button>
                    <button
                      onClick={() => setDeviceMode('desktop')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                        deviceMode === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <Monitor size={11} />
                      <span>Desktop</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Simulated Device Frame Container */}
              <div className="flex-1 flex items-center justify-center bg-slate-950/40 p-4 border border-slate-900 border-dashed rounded-2xl overflow-y-auto">
                
                {/* Simulated frame viewport width and height wrapper */}
                <div 
                  className={`border border-slate-800/80 rounded-[32px] overflow-hidden bg-white shadow-2xl relative flex flex-col transition-all duration-300 ${
                    deviceMode === 'mobile' 
                      ? 'w-[360px] h-[640px]' 
                      : 'w-full max-w-4xl h-[640px]'
                  }`}
                  style={{
                    backgroundColor: simDarkMode ? '#1e1e1e' : '#fdfcff',
                    color: simDarkMode ? '#fffdfc' : '#08102b',
                  }}
                >
                  {/* Plus UI Premium Scroll Progress Bar (Top) */}
                  <div 
                    id="sim-scroll-progress-bar"
                    className="absolute top-0 left-0 h-1.5 z-40 rounded-r-md transition-all"
                    style={{
                      width: `${simScrollPercent}%`,
                      background: `linear-gradient(to right, ${themeParams.themeColor}, ${themeParams.statusLight})`,
                      boxShadow: `0 2px 10px ${themeParams.themeColor}`
                    }}
                  />

                  {/* Simulator Device Header */}
                  <header 
                    className="h-14 border-b px-4 flex items-center justify-between sticky top-0 z-30 transition-colors"
                    style={{
                      backgroundColor: simDarkMode ? '#1e1e1e' : '#fffdfc',
                      borderColor: simDarkMode ? '#2d2d30' : '#e6e6e6'
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-indigo-500/10" style={{ color: themeParams.themeColor }}>
                        <Rss size={16} />
                      </div>
                      <span className="text-xs font-black tracking-tight" style={{ color: simDarkMode ? '#fff' : '#08102b' }}>
                        {themeParams.homeTitle && themeParams.homeTitle.split('|')[0] || 'AssignmentWaly'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 max-sm:gap-0.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: themeParams.themeColor }} />
                      <span className="text-[9px] uppercase tracking-wider opacity-60 font-mono">Live Demo</span>
                    </div>
                  </header>

                  {/* Simulated Core Scrollable Body viewport */}
                  <div 
                    ref={simulatorContentRef}
                    onScroll={handleSimulatorScroll}
                    className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth"
                    style={{
                      backgroundColor: simDarkMode ? '#1e1e1e' : '#fdfcff'
                    }}
                  >
                    {/* Simulated AIOU Solved banner */}
                    <div className="text-center space-y-2 py-4">
                      {themeParams.metaIcon && (
                        <img 
                          src={themeParams.metaIcon} 
                          alt="icon" 
                          className="w-10 h-10 mx-auto rounded-lg object-contain bg-white/10 p-1 border border-slate-700/20"
                        />
                      )}
                      <h2 className="text-lg font-extrabold tracking-tight">
                        AIOU Solved Assignments Portal
                      </h2>
                      <p className="text-xs opacity-70 max-w-xs mx-auto">
                        Spring 2026 Allama Iqbal Open University solved files, past exams papers tracker, and verified caregiver certificates.
                      </p>
                    </div>

                    {/* Simulated Navigation Menu Bar */}
                    <div 
                      className="flex border-b text-[11px] font-bold uppercase tracking-wider space-x-4 overflow-x-auto whitespace-nowrap py-1 scrollbar-none"
                      style={{ borderColor: simDarkMode ? '#2d2d30' : '#e6e6e6' }}
                    >
                      <span className="border-b-2 pb-1" style={{ borderBottomColor: themeParams.themeColor, color: themeParams.themeColor }}>Matric</span>
                      <span className="opacity-60">FA</span>
                      <span className="opacity-60">I.Com</span>
                      <span className="opacity-60">B.Ed</span>
                      <span className="opacity-60">MA</span>
                      <span className="opacity-60">Associate Degree</span>
                    </div>

                    {/* INTERACTIVE WORKSPACE WIDGET A: STUDENT SUCCESS DASHBOARD */}
                    <div 
                      className="rounded-2xl border p-5 space-y-4"
                      style={{
                        backgroundColor: simDarkMode ? '#252526' : 'rgba(0,0,0,0.02)',
                        borderColor: simDarkMode ? '#333' : '#e6e6e6'
                      }}
                    >
                      <div className="text-center">
                        <span 
                          className="text-[10px] font-mono tracking-widest uppercase px-2.5 py-0.5 rounded-full border bg-white/5"
                          style={{ borderColor: themeParams.themeColor, color: themeParams.themeColor }}
                        >
                          📈 Simulated Metrics
                        </span>
                        <h4 className="font-extrabold text-sm tracking-tight mt-2">🎓 Student Success Dashboard</h4>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                          <span className="text-lg font-black block" style={{ color: themeParams.themeColor }}>
                            {themeParams.studentsHelped}+
                          </span>
                          <span className="text-[8px] uppercase tracking-wider block opacity-70">Students</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                          <span className="text-lg font-black block" style={{ color: themeParams.themeColor }}>
                            {themeParams.assignmentsSolved}+
                          </span>
                          <span className="text-[8px] uppercase tracking-wider block opacity-70">Solved</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                          <span className="text-lg font-black block" style={{ color: themeParams.themeColor }}>
                            {themeParams.satisfactionRate}%
                          </span>
                          <span className="text-[8px] uppercase tracking-wider block opacity-70">Rate</span>
                        </div>
                      </div>

                      {/* Interactive countdown target */}
                      <div 
                        className="rounded-xl p-3.5 text-center text-white space-y-1.5 transition-all"
                        style={{
                          background: `linear-gradient(135deg, ${themeParams.themeColor}, ${themeParams.statusLight})`
                        }}
                      >
                        <p className="text-[9px] uppercase tracking-widest opacity-95">⏰ Spring 2026 Submission Deadline</p>
                        <p className="text-xl font-bold font-mono tracking-wider">{countdownStr}</p>
                        <p className="text-[8px] opacity-80">Submit before deadline date: {themeParams.deadlineDate}</p>
                      </div>
                    </div>

                    {/* INTERACTIVE WORKSPACE WIDGET B: AIOU TRENDING TOPICS */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">AIOU Trending Topics</span>
                        <TrendingUp size={12} style={{ color: themeParams.themeColor }} />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Card 1 */}
                        <div 
                          className="p-4 rounded-xl border border-l-4 space-y-1.5 transition-all hover:translate-x-1"
                          style={{
                            backgroundColor: simDarkMode ? '#2d2d30' : 'white',
                            borderColor: simDarkMode ? '#333' : '#e6e6e6',
                            borderLeftColor: themeParams.themeColor
                          }}
                        >
                          <span className="text-xs font-extrabold block">Solved Assignments 📘</span>
                          <p className="text-[10px] opacity-70 leading-snug">Spring 2026 completed PDF assignments with formatting.</p>
                          <div className="flex gap-1 flex-wrap">
                            <span className="text-[8px] px-1.5 py-0.2 rounded border select-none">4681 Soc</span>
                            <span className="text-[8px] px-1.5 py-0.2 rounded border select-none">1423 English</span>
                          </div>
                        </div>

                        {/* Card 2 */}
                        <div 
                          className="p-4 rounded-xl border border-l-4 space-y-1.5 transition-all hover:translate-x-1"
                          style={{
                            backgroundColor: simDarkMode ? '#2d2d30' : 'white',
                            borderColor: simDarkMode ? '#333' : '#e6e6e6',
                            borderLeftColor: themeParams.themeColor
                          }}
                        >
                          <span className="text-xs font-extrabold block">Tutors Database 🏫</span>
                          <p className="text-[10px] opacity-70 leading-snug">Registered regional tutors list for submissions Spring 2026.</p>
                          <div className="flex gap-1 flex-wrap">
                            <span className="text-[8px] px-1.5 py-0.2 rounded border select-none">E-CMS login</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* INTERACTIVE WORKSPACE WIDGET C: REVIEWS CAROUSEL SLIDER */}
                    <div 
                      className="rounded-2xl border p-4 space-y-3 relative"
                      style={{
                        backgroundColor: simDarkMode ? '#252526' : 'white',
                        borderColor: simDarkMode ? '#333' : '#e6e6e6'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">Verified student reviews</span>
                        <Award size={13} style={{ color: themeParams.themeColor }} />
                      </div>

                      {/* Active review window */}
                      <div className="space-y-2 animate-fade-in" key={activeReviewIndex}>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-500 text-white font-black flex items-center justify-center text-xs shadow-sm">
                            {reviewCollection[activeReviewIndex].name[0]}
                          </div>
                          <div>
                            <span className="text-xs font-bold block">{reviewCollection[activeReviewIndex].name}</span>
                            <span className="text-[9px] opacity-50 block">{reviewCollection[activeReviewIndex].course} • Verified</span>
                          </div>
                        </div>

                        <div className="text-[11px] font-semibold text-amber-500 block leading-none">
                          {'★'.repeat(reviewCollection[activeReviewIndex].stars)}
                        </div>

                        <p className="text-[10px] opacity-80 leading-relaxed italic">
                          "{reviewCollection[activeReviewIndex].text}"
                        </p>
                      </div>

                      {/* Slider dots & arrows */}
                      <div className="flex justify-between items-center pt-2 border-t dark:border-slate-800">
                        <div className="flex space-x-1.5">
                          {reviewCollection.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setActiveReviewIndex(index);
                                showNotification('success', `Review slide ${index+1}`);
                              }}
                              className={`w-1.5 h-1.5 rounded-full transition-all ${
                                activeReviewIndex === index ? 'w-4 bg-amber-500' : 'bg-slate-400'
                              }`}
                            />
                          ))}
                        </div>

                        <div className="flex space-x-1">
                          <button
                            onClick={() => {
                              const prev = activeReviewIndex === 0 ? reviewCollection.length - 1 : activeReviewIndex - 1;
                              setActiveReviewIndex(prev);
                            }}
                            className="p-1 bg-slate-500/10 rounded-md hover:bg-slate-500/20"
                          >
                            <ChevronLeft size={10} />
                          </button>
                          <button
                            onClick={() => {
                              const next = activeReviewIndex === reviewCollection.length - 1 ? 0 : activeReviewIndex + 1;
                              setActiveReviewIndex(next);
                            }}
                            className="p-1 bg-slate-500/10 rounded-md hover:bg-slate-500/20"
                          >
                            <ChevronRight size={10} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* INTERACTIVE WORKSPACE WIDGET D: WHATSAPP DIRECT CTA */}
                    <div className="text-center pt-2 pb-4">
                      <a 
                        href={themeParams.whatsappLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-xs text-white font-bold rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all"
                        style={{
                          backgroundColor: '#25D366',
                          boxShadow: '0 4px 15px rgba(37,211,102,0.3)'
                        }}
                      >
                        <MessageSquare size={13} />
                        <span>Chat on WhatsApp Support</span>
                      </a>
                    </div>

                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

          {/* ================================== TAB 3: THEME EXPORTER ================================== */}
          {activeTab === 'xml-exporter' && (
            <div className="flex-1 flex overflow-hidden bg-slate-950 p-6 gap-6">
              
              {/* Sidebar explaining details */}
              <div className="w-[300px] shrink-0 bg-slate-900 rounded-2xl border border-slate-800 p-5 flex flex-col gap-6">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Download size={16} className="text-indigo-400" />
                    <span>Theme Exporter</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Compile the optimized Blogger XML theme from your parameters instantly.
                  </p>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 space-y-3 text-xs leading-relaxed text-slate-400">
                  <span className="font-bold text-slate-200 block text-[10px] uppercase tracking-wider">
                    How it works
                  </span>
                  <p>1. Our compiler takes your custom settings (brand color, search tags, safelinks, students helped counters, disqus settings).</p>
                  <p>2. It parses the base <strong>Plus UI Blogger Premium</strong> structure.</p>
                  <p>3. It replaces variable definitions and custom HTML widgets with your configuration data.</p>
                  <p>4. Download the generated <code>.xml</code> file and restore it inside your Google Blogger settings dashboard.</p>
                </div>

                {/* Exporter action CTA */}
                <div className="space-y-2 mt-auto">
                  <button
                    onClick={handleCopyXML}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700/80 rounded-xl text-xs font-semibold border border-slate-750 text-slate-200 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    {copiedXML ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copiedXML ? 'Copied XML!' : 'Copy to Clipboard'}</span>
                  </button>

                  <button
                    onClick={handleDownloadXML}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs font-semibold shadow-md active:translate-y-[1px] transition-all flex items-center justify-center gap-2"
                  >
                    <Download size={14} />
                    <span>Download XML Theme</span>
                  </button>
                </div>
              </div>

              {/* Live Compiled XML Editor / Code Inspector (Right) */}
              <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col">
                <div className="px-5 py-3 border-b border-slate-850 bg-slate-900/30 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                    <FileText size={14} className="text-indigo-400" />
                    <span>Compiled Blogger XML Theme Output</span>
                  </div>

                  <span className="text-[10px] font-mono select-all bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800 text-slate-400">
                    Size: ~{(compileXmlTemplate(themeParams).length / 1024).toFixed(1)} KB
                  </span>
                </div>

                {/* Raw generated text viewer block */}
                <div className="flex-1 overflow-auto p-5 font-mono text-[11px] leading-relaxed text-slate-300 selection:bg-slate-750 whitespace-pre">
                  {compileXmlTemplate(themeParams)}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Editor Modal View Backdrop */}
        {showEditor && (
          <PostEditor
            post={editingPost}
            onClose={() => {
              setShowEditor(false);
              setEditingPost(null);
            }}
            onSave={handleSavePost}
            isSaving={isActionLoading}
          />
        )}
      </div>
    );
  }
