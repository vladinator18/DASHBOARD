import React, { useEffect, useState } from 'react';

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

const Dashboard: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch('/api/tickets');
        const data = await response.json();
        setTickets(data);
      } catch (error) {
        console.error('Failed to fetch tickets:', error);
      } finally {
        setLoading(false);
      }
    };

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
      setTickets(tickets.map(t => t.id === id ? { ...t, status: newStatus } : t));
    } catch (error) {
      console.error('Failed to update ticket:', error);
    }
  };

  const deleteTicket = async (id: number) => {
    try {
      await fetch(`/api/tickets?id=${id}`, { method: 'DELETE' });
      setTickets(tickets.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to delete ticket:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">Ticket Dashboard</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded-lg">
            <thead>
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">User</th>
                <th className="px-4 py-2">Message</th>
                <th className="px-4 py-2">Image</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Priority</th>
                <th className="px-4 py-2">Created</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(ticket => (
                <tr key={ticket.id} className="border-t">
                  <td className="px-4 py-2">{ticket.id}</td>
                  <td className="px-4 py-2">{ticket.username}</td>
                  <td className="px-4 py-2">{ticket.message}</td>
                  <td className="px-4 py-2">
                    {ticket.image_url ? (
                      <img src={ticket.image_url} alt="ticket" className="h-12 w-12 object-cover rounded" />
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={ticket.status}
                      onChange={e => updateTicketStatus(ticket.id, e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">{ticket.priority}</td>
                  <td className="px-4 py-2">{new Date(ticket.created_at).toLocaleString()}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => deleteTicket(ticket.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
