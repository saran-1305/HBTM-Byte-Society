import React, { useEffect, useState } from 'react';
import { IconUsers, IconCertificate, IconSend, IconCheck, IconLock, IconMessage2 } from '@tabler/icons-react';
import DashboardLayout from '../../components/layout/DashboardLayout';

const FALLBACK_USER_ID = "123e4567-e89b-12d3-a456-426614174000";

interface Certification {
  id: string;
  domain: string;
  issued_at: string;
}

interface CommunityPost {
  id: string;
  user_id: string;
  domain: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

interface MyPost {
  post: CommunityPost;
  reply_count: number;
}

const CommunityPage = () => {
  const userId = localStorage.getItem('daskalos_user_id') || FALLBACK_USER_ID;

  const [currentStage, setCurrentStage] = useState<string | null>(null);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [myPosts, setMyPosts] = useState<MyPost[]>([]);
  const [mentorFeed, setMentorFeed] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [posting, setPosting] = useState(false);

  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replying, setReplying] = useState<string | null>(null);

  const fetchAll = async () => {
    try {
      const [evalRes, certRes] = await Promise.all([
        fetch(`http://127.0.0.1:8000/api/arc/evaluation/${userId}`),
        fetch(`http://127.0.0.1:8000/api/community/certification/${userId}`),
      ]);

      const stage = evalRes.ok ? (await evalRes.json()).stage : null;
      const certs: Certification[] = certRes.ok ? await certRes.json() : [];
      setCurrentStage(stage);
      setCertifications(certs);

      if (stage === 'struggle') {
        const myPostsRes = await fetch(`http://127.0.0.1:8000/api/community/posts/mine/${userId}`);
        if (myPostsRes.ok) setMyPosts(await myPostsRes.json());
      }

      if (certs.length > 0) {
        const mentorRes = await fetch(`http://127.0.0.1:8000/api/community/posts/mentor/${userId}`);
        if (mentorRes.ok) setMentorFeed(await mentorRes.json());
      }
    } catch (err) {
      console.error("Failed to fetch community data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setPosting(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/community/posts/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });
      if (res.ok) {
        setTitle('');
        setDescription('');
        const myPostsRes = await fetch(`http://127.0.0.1:8000/api/community/posts/mine/${userId}`);
        if (myPostsRes.ok) setMyPosts(await myPostsRes.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPosting(false);
    }
  };

  const handleReply = async (postId: string) => {
    const content = replyDrafts[postId];
    if (!content || !content.trim()) return;
    setReplying(postId);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/community/posts/${postId}/reply/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        setReplyDrafts(prev => ({ ...prev, [postId]: '' }));
        const mentorRes = await fetch(`http://127.0.0.1:8000/api/community/posts/mentor/${userId}`);
        if (mentorRes.ok) setMentorFeed(await mentorRes.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setReplying(null);
    }
  };

  const handleResolve = async (postId: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/community/posts/${postId}/resolve/${userId}`, {
        method: 'POST',
      });
      if (res.ok) {
        const myPostsRes = await fetch(`http://127.0.0.1:8000/api/community/posts/mine/${userId}`);
        if (myPostsRes.ok) setMyPosts(await myPostsRes.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-32">
          <p className="text-xl tracking-widest animate-pulse font-light text-white">Loading Community...</p>
        </div>
      </DashboardLayout>
    );
  }

  const isStruggling = currentStage === 'struggle';
  const isCertified = certifications.length > 0;

  return (
    <DashboardLayout>
      <div className="space-y-12 pb-20 max-w-5xl mx-auto pt-8">

        <div>
          <h1 className="text-[28px] font-bold text-white mb-2 flex items-center gap-3">
            <IconUsers size={28} />
            Community
          </h1>
          <p className="text-[15px] text-[#999999]">Ask for help when you're struggling. Mentor others once you've made it through.</p>
        </div>

        {!isStruggling && !isCertified && (
          <div className="bg-[#121212] p-10 rounded-2xl border border-[#333333] flex flex-col items-center text-center gap-3">
            <IconLock size={32} className="text-white/30" />
            <p className="text-white/70 font-medium">Community unlocks when you enter Struggle (to ask for help) or reach Integrate (to mentor others).</p>
            <p className="text-white/40 text-sm">Your current stage: <span className="capitalize">{currentStage || 'unknown'}</span></p>
          </div>
        )}

        {isStruggling && (
          <div className="space-y-6">
            <h2 className="text-sm text-orange-400 uppercase tracking-widest font-bold">Ask the Community</h2>

            <form onSubmit={handleSubmitPost} className="bg-[#121212] p-6 rounded-2xl border border-[#333333] space-y-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What are you stuck on?"
                className="w-full bg-black border border-[#333333] text-white placeholder-[#666666] rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-400/50 transition-colors text-sm"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the setback in detail — someone who's been through it will see this."
                rows={3}
                className="w-full bg-black border border-[#333333] text-white placeholder-[#666666] rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-400/50 transition-colors text-sm resize-none"
              />
              <button
                type="submit"
                disabled={posting}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-black font-bold px-5 py-2.5 rounded-lg text-sm transition-colors"
              >
                <IconSend size={16} />
                {posting ? 'Posting...' : 'Post to Community'}
              </button>
            </form>

            <div className="space-y-4">
              {myPosts.length === 0 ? (
                <p className="text-white/40 text-sm">You haven't posted anything yet.</p>
              ) : (
                myPosts.map(({ post, reply_count }) => (
                  <div key={post.id} className="bg-[#121212] p-6 rounded-2xl border border-[#333333]">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-white font-bold">{post.title}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0 ${post.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`}>
                        {post.status}
                      </span>
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed mb-3">{post.description}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-white/30 text-xs flex items-center gap-1">
                        <IconMessage2 size={12} /> {reply_count} {reply_count === 1 ? 'reply' : 'replies'}
                      </p>
                      {post.status === 'open' && (
                        <button
                          onClick={() => handleResolve(post.id)}
                          className="text-xs text-white/50 hover:text-white flex items-center gap-1"
                        >
                          <IconCheck size={14} /> Mark resolved
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {isCertified && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="text-sm text-emerald-500 uppercase tracking-widest font-bold">Certified Mentor</h2>
              <div className="flex gap-2">
                {certifications.map(c => (
                  <span key={c.id} className="flex items-center gap-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[11px] font-bold capitalize">
                    <IconCertificate size={12} /> {c.domain}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {mentorFeed.length === 0 ? (
                <p className="text-white/40 text-sm">No open problems in your domain right now.</p>
              ) : (
                mentorFeed.map((post) => (
                  <div key={post.id} className="bg-[#121212] p-6 rounded-2xl border border-[#333333]">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-white font-bold">{post.title}</h3>
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-wide shrink-0">{post.domain}</span>
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed mb-4">{post.description}</p>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={replyDrafts[post.id] || ''}
                        onChange={(e) => setReplyDrafts(prev => ({ ...prev, [post.id]: e.target.value }))}
                        placeholder="Share how you got through this..."
                        className="flex-1 bg-black border border-[#333333] text-white placeholder-[#666666] rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500/50 transition-colors text-sm"
                      />
                      <button
                        onClick={() => handleReply(post.id)}
                        disabled={replying === post.id}
                        className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-bold px-4 py-2 rounded-lg text-sm transition-colors"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default CommunityPage;
