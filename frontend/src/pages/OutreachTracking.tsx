import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MdArrowBack, 
  MdOutlineEmail, 
  MdPhone, 
  MdCheck, 
  MdClose, 
  MdOutlineSchedule, 
  MdOutlineCalendarToday, 
  MdNotes, 
  MdOutlineInsights, 
  MdOutlineBarChart, 
  MdOutlinePieChart, 
  MdOutlineShowChart,
  MdOutlineTrackChanges,
  MdOutlineQueryStats,
  MdOutlineMoreVert,
  MdOutlineTrendingUp,
  MdOutlineAttachMoney,
  MdOutlineGroups,
  MdOutlineSpeed,
  MdOutlineTimeline,
  MdOutlineAnalytics,
  MdOutlineAssessment,
  MdOutlineDataUsage,
  MdOutlineTrendingDown,
  MdOutlineTrendingFlat,
  MdExpandMore,
  MdExpandLess,
  MdOutlineMailOutline,
  MdOutlineOpenInNew,
  MdOutlineMouse,
  MdOutlineReply
} from 'react-icons/md';
import { FaRegEdit, FaRegTrashAlt, FaRegClock, FaRegCheckCircle, FaRegTimesCircle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { 
  BarChart, Bar, 
  PieChart, Pie, Cell, 
  LineChart, Line, 
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// Add HTMLDialogElement to the global Window interface
declare global {
  interface HTMLElementTagNameMap {
    'dialog': HTMLDialogElement;
  }
}

interface EmailStatus {
  drafted: boolean;
  sent: boolean;
  scheduled: boolean;
  scheduledDate?: Date;
}

interface Facility {
  id: number;
  name: string;
  industry: string;
  location: string;
  manager: string;
  email: string;
  phone: string;
  emailStatus: EmailStatus;
  outreachStatus: {
    opened: boolean;
    openedAt?: Date;
    replied: boolean;
    repliedAt?: Date;
    interested: boolean | null;
    followUpScheduled: boolean;
    followUpDate?: Date;
    notes: string;
  };
  solarPotential: {
    annualSavings: number;
  };
}

const OutreachTracking = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [outreachData, setOutreachData] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [activeTab, setActiveTab] = useState('contacts');
  const [showContacts, setShowContacts] = useState(false);
  
  // Sample outreach data
  const sampleOutreachData = [
    {
      id: 1,
      contactName: "Jeff Levy",
      company: "Apple",
      email: "j.levy@example.com",
      phone: "(404) 555-1234",
      location: "Atlanta, GA",
      position: "Facilities Manager",
      outreachHistory: [
        {
          id: 101,
          type: "email",
          date: "2023-06-15T09:30:00",
          subject: "Reduce Energy Costs with Solar - Personalized Analysis for Apple",
          status: "sent",
          response: "interested",
          notes: "Replied same day, interested in learning more about the ROI timeline."
        },
        {
          id: 102,
          type: "call",
          date: "2023-06-17T14:00:00",
          subject: "Initial consultation call",
          status: "completed",
          response: "positive",
          notes: "30-minute call. Very interested in the proposal. Requested detailed ROI analysis."
        },
        {
          id: 103,
          type: "email",
          date: "2023-06-18T10:15:00",
          subject: "Solar Energy Proposal for Apple",
          status: "sent",
          response: "none",
          notes: "Sent detailed proposal with ROI analysis as requested."
        },
        {
          id: 104,
          type: "call",
          date: "2023-06-23T11:00:00",
          subject: "Follow-up call",
          status: "scheduled",
          response: "pending",
          notes: "Scheduled to discuss the proposal and answer any questions."
        }
      ]
    },
    {
      id: 2,
      contactName: "Amy Huke",
      company: "Honeywell",
      email: "a.huke@example.com",
      phone: "(816) 555-6789",
      location: "Kansas City, MO",
      position: "Facilities Manager",
      outreachHistory: [
        {
          id: 201,
          type: "email",
          date: "2023-06-15T09:30:00",
          subject: "Reduce Energy Costs with Solar - Personalized Analysis for Honeywell",
          status: "sent",
          response: "none",
          notes: "No response yet."
        },
        {
          id: 202,
          type: "email",
          date: "2023-06-19T09:30:00",
          subject: "Following Up: Solar Energy Savings for Honeywell",
          status: "scheduled",
          response: "pending",
          notes: "Follow-up email scheduled."
        }
      ]
    },
    {
      id: 3,
      contactName: "Ryan Kuddes",
      company: "Apple",
      email: "r.kuddes@example.com",
      phone: "(303) 555-4321",
      location: "Denver, CO",
      position: "Facilities Manager",
      outreachHistory: [
        {
          id: 301,
          type: "email",
          date: "2023-06-15T09:30:00",
          subject: "Reduce Energy Costs with Solar - Personalized Analysis for Apple",
          status: "sent",
          response: "interested",
          notes: "Replied after 2 days, interested in a call next week."
        },
        {
          id: 302,
          type: "call",
          date: "2023-06-22T15:30:00",
          subject: "Initial consultation call",
          status: "scheduled",
          response: "pending",
          notes: "Scheduled for a 20-minute call to discuss solar options."
        }
      ]
    },
    {
      id: 4,
      contactName: "Zuretti Carter",
      company: "ChargePoint",
      email: "z.carter@example.com",
      phone: "(415) 555-7890",
      location: "San Francisco, CA",
      position: "Facilities Manager",
      outreachHistory: [
        {
          id: 401,
          type: "email",
          date: "2023-06-15T09:30:00",
          subject: "Reduce Energy Costs with Solar - Personalized Analysis for ChargePoint",
          status: "sent",
          response: "not_interested",
          notes: "Replied that they already have solar installed at their facility."
        }
      ]
    },
    {
      id: 5,
      contactName: "Scott Simpson",
      company: "Plexus Corp.",
      email: "s.simpson@example.com",
      phone: "(920) 555-2345",
      location: "Neenah, WI",
      position: "Facilities Manager",
      outreachHistory: [
        {
          id: 501,
          type: "email",
          date: "2023-06-15T09:30:00",
          subject: "Reduce Energy Costs with Solar - Personalized Analysis for Plexus Corp.",
          status: "sent",
          response: "none",
          notes: "No response yet."
        },
        {
          id: 502,
          type: "call",
          date: "2023-06-16T13:45:00",
          subject: "Cold call introduction",
          status: "completed",
          response: "neutral",
          notes: "Brief call. Said they're evaluating energy options but not ready to commit. Will review our email."
        },
        {
          id: 503,
          type: "email",
          date: "2023-06-20T09:30:00",
          subject: "Following Up: Solar Energy Savings for Plexus Corp.",
          status: "scheduled",
          response: "pending",
          notes: "Follow-up email scheduled."
        }
      ]
    }
  ];

  useEffect(() => {
    // Simulate loading data
    setIsLoading(true);
    setTimeout(() => {
      setOutreachData(sampleOutreachData);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'badge-info';
      case 'completed':
        return 'badge-success';
      case 'scheduled':
        return 'badge-warning';
      default:
        return 'badge-secondary';
    }
  };

  const getResponseColor = (response: string) => {
    switch (response) {
      case 'interested':
      case 'positive':
        return 'text-success';
      case 'not_interested':
        return 'text-error';
      case 'neutral':
        return 'text-warning';
      default:
        return 'text-gray-500';
    }
  };

  const getResponseIcon = (response: string) => {
    switch (response) {
      case 'interested':
      case 'positive':
        return <FaRegCheckCircle className="text-success" />;
      case 'not_interested':
        return <FaRegTimesCircle className="text-error" />;
      case 'neutral':
        return <FaRegClock className="text-warning" />;
      case 'none':
      case 'pending':
      default:
        return <FaRegClock className="text-gray-400" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <MdOutlineEmail className="text-primary" />;
      case 'call':
        return <MdPhone className="text-primary" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAddNote = () => {
    if (!selectedContact || !newNote.trim()) {
      return;
    }

    // In a real app, you would make an API call here
    toast.success('Note added successfully');
    setNewNote('');
    setShowNoteModal(false);
  };

  const handleScheduleFollowUp = (contact: any) => {
    // In a real app, you would navigate to the email composer or show a scheduling modal
    toast.success(`Follow-up scheduled for ${contact.contactName}`);
  };

  const filteredData = outreachData.filter(contact => {
    if (filterStatus === 'all') return true;
    
    // Check if any outreach matches the filter
    return contact.outreachHistory.some((outreach: any) => {
      if (filterStatus === 'interested') {
        return ['interested', 'positive'].includes(outreach.response);
      } else if (filterStatus === 'not_interested') {
        return outreach.response === 'not_interested';
      } else if (filterStatus === 'no_response') {
        return outreach.response === 'none';
      } else if (filterStatus === 'pending') {
        return outreach.status === 'scheduled';
      }
      return false;
    });
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (sortBy === 'date') {
      // Get the most recent outreach for each contact
      const latestA = a.outreachHistory.sort((x: any, y: any) => 
        new Date(y.date).getTime() - new Date(x.date).getTime()
      )[0]?.date || '';
      
      const latestB = b.outreachHistory.sort((x: any, y: any) => 
        new Date(y.date).getTime() - new Date(x.date).getTime()
      )[0]?.date || '';
      
      return sortOrder === 'desc' 
        ? new Date(latestB).getTime() - new Date(latestA).getTime()
        : new Date(latestA).getTime() - new Date(latestB).getTime();
    } else if (sortBy === 'name') {
      return sortOrder === 'desc'
        ? b.contactName.localeCompare(a.contactName)
        : a.contactName.localeCompare(b.contactName);
    } else if (sortBy === 'company') {
      return sortOrder === 'desc'
        ? b.company.localeCompare(a.company)
        : a.company.localeCompare(b.company);
    }
    return 0;
  });

  // Analytics data
  const analyticsData = {
    // Email performance data
    emailPerformance: [
      { name: 'Sent', value: 32 },
      { name: 'Opened', value: 24 },
      { name: 'Replied', value: 14 },
      { name: 'Meetings', value: 8 },
    ],
    
    // Response rate over time
    responseRateOverTime: [
      { month: 'Jan', rate: 25 },
      { month: 'Feb', rate: 28 },
      { month: 'Mar', rate: 32 },
      { month: 'Apr', rate: 38 },
      { month: 'May', rate: 42 },
      { month: 'Jun', rate: 47 },
    ],
    
    // Engagement by industry
    engagementByIndustry: [
      { industry: 'Technology', interested: 65, neutral: 25, notInterested: 10 },
      { industry: 'Manufacturing', interested: 48, neutral: 32, notInterested: 20 },
      { industry: 'Retail', interested: 52, neutral: 28, notInterested: 20 },
      { industry: 'Healthcare', interested: 70, neutral: 20, notInterested: 10 },
      { industry: 'Education', interested: 58, neutral: 30, notInterested: 12 },
    ],
    
    // Conversion funnel
    conversionFunnel: [
      { stage: 'Contacted', count: 100 },
      { stage: 'Engaged', count: 68 },
      { stage: 'Meeting', count: 42 },
      { stage: 'Proposal', count: 28 },
      { stage: 'Closed', count: 18 },
    ],
    
    // Follow-up effectiveness
    followUpEffectiveness: [
      { followUps: '0', conversionRate: 12 },
      { followUps: '1', conversionRate: 24 },
      { followUps: '2', conversionRate: 38 },
      { followUps: '3', conversionRate: 45 },
      { followUps: '4+', conversionRate: 52 },
    ],
    
    // Response time distribution
    responseTimeDistribution: [
      { time: 'Same day', percentage: 35 },
      { time: '1-2 days', percentage: 42 },
      { time: '3-7 days', percentage: 15 },
      { time: '1-2 weeks', percentage: 5 },
      { time: '2+ weeks', percentage: 3 },
    ]
  };
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const AnalyticsCard = ({ 
    title, 
    icon, 
    children, 
    gradient = 'from-amber-500 to-amber-600',
    hoverGradient = 'from-amber-600 to-amber-700'
  }: { 
    title: string; 
    icon: React.ReactNode; 
    children: React.ReactNode;
    gradient?: string;
    hoverGradient?: string;
  }) => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
        {/* Decorative patterns */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" 
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, #000000 20px, #000000 22px)',
              backgroundSize: '30px 30px'
            }}
          ></div>
        </div>
        
        {/* Gradient orbs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-tr-full"></div>
        
        <div className="p-6 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className={`bg-gradient-to-r ${gradient} p-3 rounded-xl text-white shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
              {icon}
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">{title}</h3>
          </div>
          {children}
        </div>
      </div>
    );
  };

  const StatCard = ({ 
    title, 
    value, 
    change, 
    icon, 
    colorClass,
    trend = 'up'
  }: { 
    title: string; 
    value: string; 
    change?: string;
    icon: React.ReactNode;
    colorClass: string;
    trend?: 'up' | 'down' | 'flat';
  }) => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
        {/* Decorative patterns */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" 
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, #000000 20px, #000000 22px)',
              backgroundSize: '30px 30px'
            }}
          ></div>
        </div>
        
        {/* Gradient orbs */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full"></div>
        <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-blue-500/10 blur-2xl group-hover:bg-blue-500/20 transition-all duration-300"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
            </div>
            <div className={`rounded-xl p-3 ${colorClass} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
              {icon}
            </div>
          </div>
          {change && (
            <div className="flex items-center gap-1 text-sm font-medium">
              {trend === 'up' ? (
                <MdOutlineTrendingUp className="text-green-500" />
              ) : trend === 'down' ? (
                <MdOutlineTrendingDown className="text-red-500" />
              ) : (
                <MdOutlineTrendingFlat className="text-yellow-500" />
              )}
              <span className={trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-yellow-500'}>
                {change}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const ContactCard = ({ contact }: { contact: any }) => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
        {/* Decorative patterns */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" 
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, #000000 20px, #000000 22px)',
              backgroundSize: '30px 30px'
            }}
          ></div>
        </div>
        
        {/* Gradient orbs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-tr-full"></div>
        
        <div className="p-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            {/* Contact Info */}
            <div className="flex-1">
              <h2 className="text-xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">{contact.contactName}</h2>
              <div className="text-sm text-gray-600 dark:text-gray-400">{contact.position} at {contact.company}</div>
              <div className="mt-3 flex flex-col gap-2">
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 px-4 py-2 rounded-lg">
                  <MdOutlineEmail className="text-amber-500" size={18} />
                  <span className="text-gray-700 dark:text-gray-300">{contact.email}</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 px-4 py-2 rounded-lg">
                  <MdPhone className="text-amber-500" size={18} />
                  <span className="text-gray-700 dark:text-gray-300">{contact.phone}</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 px-4 py-2 rounded-lg">
                  <MdOutlineCalendarToday className="text-amber-500" size={18} />
                  <span className="text-gray-700 dark:text-gray-300">{contact.location}</span>
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <button 
                  onClick={() => {
                    setSelectedContact(contact);
                    setShowNoteModal(true);
                  }}
                  className="btn btn-sm btn-outline gap-1 hover:bg-amber-500 hover:text-white transition-colors"
                >
                  <MdNotes size={16} />
                  Add Note
                </button>
                <button 
                  onClick={() => handleScheduleFollowUp(contact)}
                  className="btn btn-sm btn-outline gap-1 hover:bg-amber-500 hover:text-white transition-colors"
                >
                  <MdOutlineSchedule size={16} />
                  Schedule Follow-up
                </button>
              </div>
            </div>
            
            {/* Outreach History */}
            <div className="flex-[2]">
              <h3 className="font-medium mb-3 text-gray-900 dark:text-white">Outreach History</h3>
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Subject</th>
                      <th>Status</th>
                      <th>Response</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contact.outreachHistory
                      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((outreach: any) => (
                        <tr key={outreach.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="whitespace-nowrap">{formatDate(outreach.date)}</td>
                          <td className="flex items-center gap-1">
                            {getTypeIcon(outreach.type)}
                            <span className="capitalize">{outreach.type}</span>
                          </td>
                          <td className="max-w-[200px] truncate" title={outreach.subject}>
                            {outreach.subject}
                          </td>
                          <td>
                            <span className={`badge ${getStatusColor(outreach.status)}`}>
                              {outreach.status}
                            </span>
                          </td>
                          <td className="flex items-center gap-1">
                            {getResponseIcon(outreach.response)}
                            <span className={`capitalize ${getResponseColor(outreach.response)}`}>
                              {outreach.response === 'none' ? 'No response' : outreach.response}
                            </span>
                          </td>
                          <td className="max-w-[200px] truncate" title={outreach.notes}>
                            {outreach.notes}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Sample metrics data
  const metricsData = {
    sequenceStarted: 636,
    openRate: {
      percentage: 48,
      count: 307
    },
    clickRate: {
      percentage: 12,
      count: 79
    },
    replyRate: {
      percentage: 5.0,
      count: 32
    },
    opportunities: {
      count: 5,
      value: 0
    },
    timelineData: [
      { date: '13 Dec', sent: 150, totalOpens: 120, uniqueOpens: 80, totalReplies: 40, totalClicks: 30, uniqueClicks: 25 },
      { date: '15 Dec', sent: 130, totalOpens: 100, uniqueOpens: 70, totalReplies: 35, totalClicks: 25, uniqueClicks: 20 },
      { date: '17 Dec', sent: 180, totalOpens: 140, uniqueOpens: 90, totalReplies: 45, totalClicks: 35, uniqueClicks: 30 },
      { date: '19 Dec', sent: 200, totalOpens: 160, uniqueOpens: 100, totalReplies: 50, totalClicks: 40, uniqueClicks: 35 },
      { date: '21 Dec', sent: 120, totalOpens: 90, uniqueOpens: 60, totalReplies: 30, totalClicks: 20, uniqueClicks: 15 },
      { date: '23 Dec', sent: 90, totalOpens: 70, uniqueOpens: 45, totalReplies: 25, totalClicks: 15, uniqueClicks: 12 },
      { date: '25 Dec', sent: 60, totalOpens: 45, uniqueOpens: 30, totalReplies: 15, totalClicks: 10, uniqueClicks: 8 },
      { date: '27 Dec', sent: 40, totalOpens: 30, uniqueOpens: 20, totalReplies: 10, totalClicks: 8, uniqueClicks: 6 },
      { date: '29 Dec', sent: 30, totalOpens: 25, uniqueOpens: 15, totalReplies: 8, totalClicks: 6, uniqueClicks: 5 },
      { date: '31 Dec', sent: 20, totalOpens: 15, uniqueOpens: 10, totalReplies: 5, totalClicks: 4, uniqueClicks: 3 },
      { date: '02 Jan', sent: 10, totalOpens: 8, uniqueOpens: 5, totalReplies: 3, totalClicks: 2, uniqueClicks: 2 },
      { date: '04 Jan', sent: 200, totalOpens: 160, uniqueOpens: 100, totalReplies: 50, totalClicks: 40, uniqueClicks: 35 },
      { date: '06 Jan', sent: 180, totalOpens: 140, uniqueOpens: 90, totalReplies: 45, totalClicks: 35, uniqueClicks: 30 },
      { date: '08 Jan', sent: 160, totalOpens: 120, uniqueOpens: 80, totalReplies: 40, totalClicks: 30, uniqueClicks: 25 },
      { date: '10 Jan', sent: 140, totalOpens: 100, uniqueOpens: 70, totalReplies: 35, totalClicks: 25, uniqueClicks: 20 },
      { date: '12 Jan', sent: 120, totalOpens: 90, uniqueOpens: 60, totalReplies: 30, totalClicks: 20, uniqueClicks: 15 }
    ]
  };

  const MetricCard = ({ 
    title, 
    value, 
    subValue,
    icon,
    colorClass = 'text-amber-500'
  }: { 
    title: string;
    value: string | number;
    subValue?: string | number;
    icon: React.ReactNode;
    colorClass?: string;
  }) => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
        {/* Decorative patterns */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" 
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, #000000 20px, #000000 22px)',
              backgroundSize: '30px 30px'
            }}
          ></div>
        </div>
        
        {/* Gradient orbs */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <span className={`${colorClass} text-2xl`}>{icon}</span>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
          </div>
          
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{value}</span>
            {subValue && (
              <span className="text-gray-500 dark:text-gray-400">| {subValue}</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center relative overflow-hidden">
        {/* Animated background patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" 
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, #ffffff 20px, #ffffff 22px)',
              backgroundSize: '30px 30px'
            }}
          ></div>
        </div>
        
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="relative z-10 flex flex-col items-center gap-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="loading loading-spinner loading-lg text-amber-500 relative"></div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Loading Analytics</h2>
            <p className="text-gray-400">Preparing your outreach insights...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center sticky top-0 z-50 bg-white dark:bg-gray-900 py-4 px-6 shadow-lg backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/email-automation')}
              className="btn btn-circle btn-ghost hover:bg-amber-500/10 transition-colors"
            >
              <MdArrowBack size={24} />
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">Campaign Analytics</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <span>Status:</span>
              <span className="badge badge-warning">Paused</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <span>Last 4 weeks</span>
              <button className="btn btn-ghost btn-circle btn-sm">
                <MdOutlineMoreVert />
              </button>
            </div>
          </div>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <MetricCard 
            title="Sequence started" 
            value={metricsData.sequenceStarted}
            icon={<MdOutlineMailOutline />}
          />
          <MetricCard 
            title="Open rate" 
            value={`${metricsData.openRate.percentage}%`}
            subValue={metricsData.openRate.count}
            icon={<MdOutlineOpenInNew />}
            colorClass="text-blue-500"
          />
          <MetricCard 
            title="Click rate" 
            value={`${metricsData.clickRate.percentage}%`}
            subValue={metricsData.clickRate.count}
            icon={<MdOutlineMouse />}
            colorClass="text-green-500"
          />
          <MetricCard 
            title="Reply rate" 
            value={`${metricsData.replyRate.percentage}%`}
            subValue={metricsData.replyRate.count}
            icon={<MdOutlineReply />}
            colorClass="text-purple-500"
          />
          <MetricCard 
            title="Opportunities" 
            value={metricsData.opportunities.count}
            subValue={`$${metricsData.opportunities.value}`}
            icon={<MdOutlineAttachMoney />}
            colorClass="text-amber-500"
          />
        </div>

        {/* Timeline Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 relative overflow-hidden">
          {/* Decorative patterns */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" 
              style={{
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, #000000 20px, #000000 22px)',
                backgroundSize: '30px 30px'
              }}
            ></div>
          </div>
          
          {/* Gradient orbs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-tr-full"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Campaign Performance</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Sent</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total opens</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Unique opens</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total replies</span>
                </div>
              </div>
            </div>
            
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metricsData.timelineData}>
                  <defs>
                    <linearGradient id="sent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="totalOpens" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EAB308" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#EAB308" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="uniqueOpens" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="totalReplies" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A855F7" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#A855F7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis dataKey="date" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937',
                      border: 'none',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sent" 
                    stroke="#3B82F6" 
                    fillOpacity={1} 
                    fill="url(#sent)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="totalOpens" 
                    stroke="#EAB308" 
                    fillOpacity={1} 
                    fill="url(#totalOpens)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="uniqueOpens" 
                    stroke="#22C55E" 
                    fillOpacity={1} 
                    fill="url(#uniqueOpens)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="totalReplies" 
                    stroke="#A855F7" 
                    fillOpacity={1} 
                    fill="url(#totalReplies)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Contacts Section Toggle */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Contact Details</h2>
          <button 
            onClick={() => setShowContacts(!showContacts)}
            className="btn btn-ghost gap-2"
          >
            {showContacts ? (
              <>
                <span>Hide Contacts</span>
                <MdExpandLess />
              </>
            ) : (
              <>
                <span>Show Contacts</span>
                <MdExpandMore />
              </>
            )}
          </button>
        </div>

        {/* Contacts Section */}
        {showContacts && (
          <>
            <div className="flex gap-3">
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-outline">
                  Filter: {filterStatus === 'all' ? 'All Contacts' : 
                    filterStatus === 'interested' ? 'Interested' :
                    filterStatus === 'not_interested' ? 'Not Interested' :
                    filterStatus === 'no_response' ? 'No Response' : 'Pending'}
                </label>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                  <li><button onClick={() => setFilterStatus('all')}>All Contacts</button></li>
                  <li><button onClick={() => setFilterStatus('interested')}>Interested</button></li>
                  <li><button onClick={() => setFilterStatus('not_interested')}>Not Interested</button></li>
                  <li><button onClick={() => setFilterStatus('no_response')}>No Response</button></li>
                  <li><button onClick={() => setFilterStatus('pending')}>Pending Follow-ups</button></li>
                </ul>
              </div>
              
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-outline">
                  Sort: {sortBy === 'date' ? 'Date' : 
                    sortBy === 'name' ? 'Name' : 'Company'} ({sortOrder === 'desc' ? 'Desc' : 'Asc'})
                </label>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                  <li><button onClick={() => { setSortBy('date'); setSortOrder('desc'); }}>Latest First</button></li>
                  <li><button onClick={() => { setSortBy('date'); setSortOrder('asc'); }}>Oldest First</button></li>
                  <li><button onClick={() => { setSortBy('name'); setSortOrder('asc'); }}>Name (A-Z)</button></li>
                  <li><button onClick={() => { setSortBy('name'); setSortOrder('desc'); }}>Name (Z-A)</button></li>
                  <li><button onClick={() => { setSortBy('company'); setSortOrder('asc'); }}>Company (A-Z)</button></li>
                  <li><button onClick={() => { setSortBy('company'); setSortOrder('desc'); }}>Company (Z-A)</button></li>
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {sortedData.map(contact => (
                <ContactCard key={contact.id} contact={contact} />
              ))}
            </div>
            
            {sortedData.length === 0 && (
              <div className="card bg-white dark:bg-gray-800 shadow-lg">
                <div className="card-body p-6 text-center">
                  <p className="text-gray-500">No contacts match the current filter.</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Add Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md relative overflow-hidden">
            {/* Decorative patterns */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" 
                style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, #000000 20px, #000000 22px)',
                  backgroundSize: '30px 30px'
                }}
              ></div>
            </div>
            
            {/* Gradient orbs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full"></div>
            
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-4 bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
                Add Note for {selectedContact?.contactName}
              </h3>
              <div className="form-control">
                <textarea 
                  className="textarea textarea-bordered h-32"
                  placeholder="Enter your note here..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button 
                  onClick={() => setShowNoteModal(false)}
                  className="btn btn-outline hover:bg-amber-500 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddNote}
                  className="btn bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                  disabled={!newNote.trim()}
                >
                  Save Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutreachTracking; 