import React, { useState, useEffect } from 'react';
import { 
  IconBrandLinkedin, 
  IconCheck, 
  IconClock, 
  IconAlertCircle, 
  IconSend, 
  IconRefresh,
  IconCalendar,
  IconCheckupList
} from '@tabler/icons-react';
import DashboardLayout from '../../components/layout/DashboardLayout';

interface PublishingJob {
  id: number;
  status: string;
  scheduled_time?: string;
  published_at?: string;
  growth_content_id?: number;
  url?: string;
}

interface Account {
  id: number;
  platform_name: string;
  is_connected: boolean;
}

const PublishingPage = () => {
  const [activeTab, setActiveTab] = useState('queue');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [queue, setQueue] = useState<PublishingJob[]>([]);
  const [history, setHistory] = useState<PublishingJob[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [accRes, qRes, hRes] = await Promise.all([
        fetch('http://localhost:8000/api/publishing/accounts'),
        fetch('http://localhost:8000/api/publishing/queue'),
        fetch('http://localhost:8000/api/publishing/history')
      ]);
      if (accRes.ok) setAccounts(await accRes.json());
      if (qRes.ok) setQueue(await qRes.json());
      if (hRes.ok) setHistory(await hRes.json());
    } catch (err) {
      console.error('Error fetching publishing data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConnect = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/publishing/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: 'LinkedIn' })
      });
      if (res.ok) {
        const data = await res.json();
        window.location.href = data.url; 
      }
    } catch (err) {
      console.error('Error connecting', err);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await fetch(`http://localhost:8000/api/publishing/approve/${id}`, { method: 'POST' });
      fetchData();
    } catch (err) {
      console.error('Error approving', err);
    }
  };

  const handlePublishNow = async (id: number) => {
    try {
      await fetch(`http://localhost:8000/api/publishing/publish/${id}`, { method: 'POST' });
      fetchData();
    } catch (err) {
      console.error('Error publishing', err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Published':
      case 'Verified Published': return <IconCheck className="w-4 h-4 text-emerald-400" />;
      case 'Scheduled': return <IconClock className="w-4 h-4 text-blue-400" />;
      case 'Draft': return <IconCheckupList className="w-4 h-4 text-gray-400" />;
      case 'Failed': return <IconAlertCircle className="w-4 h-4 text-red-400" />;
      default: return <IconCheckupList className="w-4 h-4 text-yellow-400" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header Section */}
        <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Growth Sharing Engine</h1>
          <p className="text-gray-400">Manage, schedule, and automate your insights across platforms.</p>
        </div>
        
        {/* Connected Accounts */}
        <div className="flex gap-4">
          {accounts.length > 0 ? (
            accounts.map(acc => (
              <div key={acc.id} className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A]/80 backdrop-blur-md rounded-full border border-emerald-500/30">
                <IconBrandLinkedin className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-medium text-white">{acc.platform_name} Connected</span>
              </div>
            ))
          ) : (
            <button 
              onClick={handleConnect}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 transition-colors rounded-full text-sm font-medium text-white"
            >
              <IconBrandLinkedin className="w-5 h-5" />
              Connect LinkedIn
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-[#1A1A1A] rounded-xl w-fit">
        {['queue', 'history', 'calendar'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              activeTab === tab 
                ? 'bg-[#2A2A2A] text-white shadow-sm' 
                : 'text-gray-400 hover:text-white hover:bg-[#2A2A2A]/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-[#1A1A1A]/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6 min-h-[400px]">
        {loading ? (
          <div className="flex justify-center items-center h-64 text-gray-400">Loading engine state...</div>
        ) : (
          <>
            {/* QUEUE TAB */}
            {activeTab === 'queue' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white mb-4">Publishing Queue</h3>
                {queue.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">No pending jobs in the queue.</div>
                ) : (
                  queue.map(job => (
                    <div key={job.id} className="flex items-center justify-between p-4 bg-[#2A2A2A]/50 hover:bg-[#2A2A2A] transition-colors rounded-xl border border-white/5 group">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-black/50 rounded-lg">
                          {getStatusIcon(job.status)}
                        </div>
                        <div>
                          <div className="text-white font-medium">Growth Insight #{job.growth_content_id}</div>
                          <div className="text-sm text-gray-400 flex items-center gap-2">
                            Status: <span className="text-gray-300">{job.status}</span>
                            {job.scheduled_time && (
                              <>
                                <span>•</span>
                                <span>Scheduled: {new Date(job.scheduled_time).toLocaleString()}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {job.status === 'Draft' && (
                          <button 
                            onClick={() => handleApprove(job.id)}
                            className="px-4 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        <button 
                          onClick={() => handlePublishNow(job.id)}
                          className="flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium transition-colors"
                        >
                          <IconSend className="w-4 h-4" /> Publish Now
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* HISTORY TAB */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">Publishing History</h3>
                  <button onClick={fetchData} className="text-gray-400 hover:text-white transition-colors">
                    <IconRefresh className="w-5 h-5" />
                  </button>
                </div>
                {history.filter(j => j.status === 'Published' || j.status === 'Failed' || j.status === 'Verified Published').length === 0 ? (
                  <div className="text-center py-12 text-gray-500">No publishing history available.</div>
                ) : (
                  history.filter(j => j.status === 'Published' || j.status === 'Failed' || j.status === 'Verified Published').map(job => (
                    <div key={job.id} className="flex items-center justify-between p-4 bg-[#2A2A2A]/30 rounded-xl border border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-black/30 rounded-lg">
                          {getStatusIcon(job.status)}
                        </div>
                        <div>
                          <div className="text-gray-200 font-medium">Post for Content #{job.growth_content_id}</div>
                          <div className="text-sm text-gray-500">
                            {job.published_at ? new Date(job.published_at).toLocaleString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {job.status === 'Failed' && (
                          <button 
                            onClick={() => handlePublishNow(job.id)}
                            className="flex items-center gap-2 px-4 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 rounded-lg text-sm font-medium transition-colors"
                          >
                            <IconRefresh className="w-4 h-4" /> Retry
                          </button>
                        )}
                        {job.url && (
                          <a 
                            href={job.url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            View Post
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* CALENDAR TAB */}
            {activeTab === 'calendar' && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <IconCalendar className="w-16 h-16 mb-4 opacity-20" />
                <h3 className="text-lg font-medium text-white mb-2">Publishing Calendar</h3>
                <p className="text-sm text-center max-w-sm">
                  Calendar view is currently being integrated with the Growth Planner module.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      </div>
    </DashboardLayout>
  );
};

export default PublishingPage;
