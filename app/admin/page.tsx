'use client'

import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line } from 'recharts'
import { ArrowUpRight, Users, Clock, DollarSign } from 'lucide-react'

const revenueData = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 5000 },
  { name: 'Apr', value: 8000 },
  { name: 'May', value: 11000 },
  { name: 'Jun', value: 14000 },
]

const practiceData = [
  { name: 'Corporate', count: 45 },
  { name: 'Family', count: 30 },
  { name: 'Criminal', count: 15 },
  { name: 'Property', count: 20 },
]

const onboardingData = [
  { name: 'W1', lawyers: 2 },
  { name: 'W2', lawyers: 5 },
  { name: 'W3', lawyers: 4 },
  { name: 'W4', lawyers: 12 },
]

const kpiCards = [
  { title: 'Total Revenue', value: '₹4.2M', change: '+12.5%', icon: DollarSign },
  { title: 'Active Lawyers', value: '184', change: '+5.2%', icon: Users },
  { title: 'Pending Approvals', value: '23', change: '+14%', icon: Clock },
  { title: 'Consultation Mins', value: '12,450', change: '+8.1%', icon: ArrowUpRight },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
        <p className="text-slate-400">Welcome back, Admin. Here's what's happening today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, i) => {
          const Icon = kpi.icon
          return (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-[#D4AF37]/10 rounded-lg text-[#D4AF37]">
                  <Icon size={20} />
                </div>
                <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
                  {kpi.change}
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-1">{kpi.title}</p>
              <p className="text-3xl font-bold text-white">{kpi.value}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="lg:col-span-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6 h-[400px]"
        >
          <h2 className="text-lg font-semibold text-white mb-6">Revenue Over Time</h2>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="name" stroke="#888" tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
              <YAxis stroke="#888" tick={{ fill: '#888' }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0A0D14', borderColor: 'rgba(212, 175, 55, 0.2)' }}
                itemStyle={{ color: '#D4AF37' }}
              />
              <Area type="monotone" dataKey="value" stroke="#D4AF37" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Practice Areas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6 h-[400px] flex flex-col"
        >
          <h2 className="text-lg font-semibold text-white mb-6">Consultations by Practice</h2>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={practiceData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#888" axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A0D14', borderColor: 'rgba(212, 175, 55, 0.2)' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="count" fill="#D4AF37" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Onboarding Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="lg:col-span-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6 h-[300px]"
        >
          <h2 className="text-lg font-semibold text-white mb-6">Lawyer Onboarding (This Month)</h2>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={onboardingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="name" stroke="#888" axisLine={false} tickLine={false} />
              <YAxis stroke="#888" axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0A0D14', borderColor: 'rgba(212, 175, 55, 0.2)' }}
              />
              <Line type="monotone" dataKey="lawyers" stroke="#D4AF37" strokeWidth={3} dot={{ fill: '#D4AF37', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  )
}
