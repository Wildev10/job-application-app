'use client';

import { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

/**
 * Render a dark area chart for 30-day activity evolution.
 */
export default function ActivityChart({ data = [], dataKey = 'count', height = 280 }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => setIsReady(true));
    return () => cancelAnimationFrame(frameId);
  }, []);

  if (!isReady) {
    return <div style={{ width: '100%', height, minWidth: 0, minHeight: height }} aria-hidden />;
  }

  return (
    <div style={{ width: '100%', height, minWidth: 0, minHeight: height }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <AreaChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="saArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6EE7B7" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6EE7B7" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#374151" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={{ stroke: '#374151' }} tickLine={false} />
          <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#111827',
              border: '1px solid #374151',
              borderRadius: '10px',
              color: '#F9FAFB',
            }}
            labelStyle={{ color: '#F9FAFB' }}
          />
          <Area type="monotone" dataKey={dataKey} stroke="#6EE7B7" strokeWidth={2} fill="url(#saArea)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
