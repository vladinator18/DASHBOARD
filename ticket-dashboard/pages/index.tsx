import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Clock, Trash2, RefreshCw, Filter, Search } from 'lucide-react';

interface Ticket {
  id: number;
  username: string;
  message: string;
  image_url?: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

const Dashboard = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ open: 0, in_progress: 0, closed: 0, total: 0 });

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/tickets');
      const data = await response.json();
      setTickets(data);
      
      // Calculate stats
      const open = data.filter((t: Ticket) => t.status === 'open').length;
      const in_progress = data.filter((t: Ticket) => t.status === 'in_progress').length;
      const closed = data.filter((t: Ticket) => t.status === 'closed').length;
      setStats({ open, in_progress, closed, total: data.length });
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateTicketStatus = async (id: number, newStatus: string) => {
    try {
      await fetch('/api/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      fetchTickets();
    } catch (error) {
      console.error('Failed to update ticket:', error);
    }
  };

  const deleteTicket = async (id: number) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return;
    try {
      await fetch(`/api/tickets?id=${id}`, { method: 'DELETE' });
      fetchTickets();
    } catch (error) {
      console.error('Failed to delete ticket:', error);
    }
  };

  const filteredTickets = tickets
    .filter(t => filter === 'all' || t.status === filter)
    .filter(t => 
      t.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'closed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ticket Dashboard</h1>
              <p className="text-gray-500 mt-1">Manage and track support tickets</p>
            </div>
            <button
              onClick={fetchTickets}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.open}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{stats.in_progress}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <RefreshCw className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Closed</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.closed}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('open')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'open' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Open
              </button>
              <button
                onClick={() => setFilter('in_progress')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'in_progress' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => setFilter('closed')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'closed' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Closed
              </button>
            </div>
          </div>
        </div>

        {/* Tickets List */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading tickets...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No tickets found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <div key={ticket.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  {/* Image */}
                  {ticket.image_url && (
                    <img
                      src={ticket.image_url}
                      alt="Ticket"
                      className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                    />
                  )}

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Ticket #{ticket.id}</h3>
                        <p className="text-sm text-gray-600 mt-1">By {ticket.username}</p>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4">{ticket.message}</p>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Created {new Date(ticket.created_at).toLocaleString()}
                      </div>

                      <div className="flex gap-2">
                        <select
                          value={ticket.status}
                          onChange={(e) => updateTicketStatus(ticket.id, e.target.value)}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="closed">Closed</option>
                        </select>

                        <button
                          onClick={() => deleteTicket(ticket.id)}
                          className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
