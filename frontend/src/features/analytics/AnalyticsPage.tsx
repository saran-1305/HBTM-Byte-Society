import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const JOURNEY_DATA = [
  { date: 'Jul 04', stage: 1, isTransition: false, isDrift: false },
  { date: 'Jul 07', stage: 2, isTransition: true, isDrift: false },
  { date: 'Jul 10', stage: 2, isTransition: false, isDrift: false },
  { date: 'Jul 13', stage: 3, isTransition: true, isDrift: false },
  { date: 'Jul 16', stage: 3, isTransition: false, isDrift: false },
  { date: 'Jul 19', stage: 2, isTransition: false, isDrift: true },
  { date: 'Jul 22', stage: 3, isTransition: true, isDrift: false },
  { date: 'Jul 25', stage: 3, isTransition: false, isDrift: false },
  { date: 'Jul 28', stage: 4, isTransition: true, isDrift: false },
  { date: 'Jul 31', stage: 4, isTransition: false, isDrift: false },
  { date: 'Aug 01', stage: 4, isTransition: false, isDrift: false },
];

const STAGE_NAMES = ['Explore', 'Commit', 'Struggle', 'Breakthrough', 'Integrate'];

const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  
  if (payload.isDrift) {
    return <circle cx={cx} cy={cy} r={5} fill="#F97316" stroke="#0B0F1A" strokeWidth={2} />;
  }
  if (payload.isTransition) {
    return <circle cx={cx} cy={cy} r={5} fill="#34D399" stroke="#0B0F1A" strokeWidth={2} />;
  }
  return null;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#131826] border border-[#1F2937] p-3 rounded-lg shadow-xl">
        <p className="text-white font-medium mb-1">{label}</p>
        <p className="text-[#9CA3AF] text-sm">Stage: <span className="text-white">{STAGE_NAMES[data.stage - 1]}</span></p>
        {data.isTransition && <p className="text-[#34D399] text-xs mt-1 font-semibold">Stage Transition</p>}
        {data.isDrift && <p className="text-[#F97316] text-xs mt-1 font-semibold">Identity Drift Noticed</p>}
      </div>
    );
  }
  return null;
};

const AnalyticsPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-[28px] font-bold text-white mb-2">Analytics</h1>
          <p className="text-[15px] text-[#9CA3AF]">How your journey has actually moved, not how much time you've spent.</p>
        </div>

        {/* Top Stat Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#131826] border border-[#1F2937] p-6 rounded-xl flex flex-col justify-between min-h-[140px]">
            <div>
              <p className="text-sm font-medium text-[#9CA3AF] mb-1">Current stage</p>
              <h2 className="text-[24px] font-bold text-white leading-tight">Commit</h2>
              <p className="text-[12px] text-[#9CA3AF] mt-1">3rd of 5 stages</p>
            </div>
            <div className="flex gap-1.5 mt-4">
              <div className="h-1.5 flex-1 bg-[#6366F1] rounded-full"></div>
              <div className="h-1.5 flex-1 bg-[#6366F1] rounded-full"></div>
              <div className="h-1.5 flex-1 bg-[#6366F1] rounded-full"></div>
              <div className="h-1.5 flex-1 bg-[#1F2937] rounded-full"></div>
              <div className="h-1.5 flex-1 bg-[#1F2937] rounded-full"></div>
            </div>
          </div>

          <div className="bg-[#131826] border border-[#1F2937] p-6 rounded-xl flex flex-col justify-between min-h-[140px]">
            <div>
              <p className="text-sm font-medium text-[#9CA3AF] mb-1">Depth score</p>
              <h2 className="text-[24px] font-bold text-white leading-tight flex items-baseline gap-1">
                78 <span className="text-[16px] font-medium text-[#9CA3AF]">/100</span>
              </h2>
            </div>
            <p className="text-[12px] text-[#9CA3AF] mt-4 leading-relaxed">
              Completions & reflections relative to time spent
            </p>
          </div>

          <div className="bg-[#131826] border border-[#1F2937] p-6 rounded-xl flex flex-col justify-between min-h-[140px]">
            <div>
              <p className="text-sm font-medium text-[#9CA3AF] mb-1">Curations this month</p>
              <h2 className="text-[24px] font-bold text-white leading-tight">24</h2>
            </div>
            <p className="text-[12px] text-[#9CA3AF] mt-4">
              6 media · 10 knowledge · 8 experience
            </p>
          </div>
        </div>

        {/* Journey Timeline Chart */}
        <div className="bg-[#131826] border border-[#1F2937] p-6 rounded-xl">
          <h2 className="text-[16px] font-medium text-white mb-6">Journey over time</h2>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={JOURNEY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  domain={[1, 5]} 
                  ticks={[1, 2, 3, 4, 5]} 
                  tickFormatter={(val) => STAGE_NAMES[val - 1]} 
                  stroke="#9CA3AF" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="stepAfter" 
                  dataKey="stage" 
                  stroke="#6366F1" 
                  strokeWidth={2} 
                  dot={<CustomDot />} 
                  activeDot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-6 mt-6 pt-4 border-t border-[#1F2937]/50">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#34D399]"></div>
              <span className="text-[12px] text-[#9CA3AF]">Stage transition</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#F97316]"></div>
              <span className="text-[12px] text-[#9CA3AF]">Identity drift noticed</span>
            </div>
          </div>
        </div>

        {/* Breakdown Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#131826] border border-[#1F2937] p-6 rounded-xl">
            <h2 className="text-[15px] font-medium text-white mb-6">Content breakdown</h2>
            <div className="space-y-4">
              <div className="w-full flex h-3 rounded-full overflow-hidden mb-6">
                <div style={{ width: '25%' }} className="bg-[#6366F1]"></div>
                <div style={{ width: '42%' }} className="bg-[#34D399]"></div>
                <div style={{ width: '33%' }} className="bg-purple-400"></div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#6366F1]"></div>
                  <span className="text-[#9CA3AF]">Media</span>
                </div>
                <span className="text-white font-medium">25%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#34D399]"></div>
                  <span className="text-[#9CA3AF]">Knowledge</span>
                </div>
                <span className="text-white font-medium">42%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  <span className="text-[#9CA3AF]">Experience</span>
                </div>
                <span className="text-white font-medium">33%</span>
              </div>
            </div>
          </div>

          <div className="bg-[#131826] border border-[#1F2937] p-6 rounded-xl">
            <h2 className="text-[15px] font-medium text-white mb-6">Feedback breakdown</h2>
            <div className="space-y-4">
              <div className="w-full flex h-3 rounded-full overflow-hidden mb-6">
                <div style={{ width: '58%' }} className="bg-[#6366F1]"></div>
                <div style={{ width: '13%' }} className="bg-[#34D399]"></div>
                <div style={{ width: '12%' }} className="bg-[#F97316]"></div>
                <div style={{ width: '17%' }} className="bg-[#1F2937]"></div>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#6366F1]"></div>
                    <span className="text-[#9CA3AF]">Resonated</span>
                  </div>
                  <span className="text-white font-medium">58%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#34D399]"></div>
                    <span className="text-[#9CA3AF]">Did it</span>
                  </div>
                  <span className="text-white font-medium">13%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#F97316]"></div>
                    <span className="text-[#9CA3AF]">Already knew</span>
                  </div>
                  <span className="text-white font-medium">12%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#1F2937]"></div>
                    <span className="text-[#9CA3AF]">Not for me</span>
                  </div>
                  <span className="text-white font-medium">17%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
          <div className="bg-[#131826] border border-[#1F2937] p-6 rounded-xl flex flex-col justify-between">
            <h2 className="text-[15px] font-medium text-white mb-2">Wildcard picks</h2>
            <div className="mt-4">
              <span className="text-[24px] font-bold text-white mr-2">5</span>
              <span className="text-[14px] text-[#9CA3AF] font-medium">of 24</span>
            </div>
            <p className="text-[12px] text-[#9CA3AF] mt-2">Content deliberately outside your usual domain</p>
          </div>
          
          <div className="bg-[#131826] border border-[#1F2937] p-6 rounded-xl flex flex-col justify-between">
            <h2 className="text-[15px] font-medium text-white mb-2">Drift moments noticed</h2>
            <div className="mt-4">
              <span className="text-[24px] font-bold text-white mr-2">2</span>
            </div>
            <p className="text-[12px] text-[#9CA3AF] mt-2">Times DASKALOS flagged a gap between your stated goal and actual behavior</p>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
