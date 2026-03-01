'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import Table from './Table';
import type { Connection } from '@/types';

export default function ConnectionsManager() {
  const [connections, setConnections] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    fromRoomId: '',
    toRoomId: '',
    lengthMeters: '',
    rackInfo: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [connectionsRes, roomsRes] = await Promise.all([
        fetch('/api/connections'),
        fetch('/api/rooms'),
      ]);
      const connectionsData = await connectionsRes.json();
      const roomsData = await roomsRes.json();

      if (connectionsData.success) setConnections(connectionsData.connections);
      if (roomsData.success) setRooms(roomsData.rooms);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingConnection ? `/api/connections/${editingConnection.id}` : '/api/connections';
    const method = editingConnection ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          lengthMeters: parseFloat(formData.lengthMeters),
        }),
      });

      if (response.ok) {
        await fetchData();
        closeModal();
      }
    } catch (error) {
      console.error('Failed to save connection:', error);
    }
  };

  const handleDelete = async (connection: any) => {
    if (!confirm(`Delete connection between "${connection.fromRoom?.systemId}" and "${connection.toRoom?.systemId}"?`)) return;

    try {
      const response = await fetch(`/api/connections/${connection.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to delete connection:', error);
    }
  };

  const openModal = (connection?: any) => {
    if (connection) {
      setEditingConnection(connection);
      setFormData({
        fromRoomId: connection.fromRoomId,
        toRoomId: connection.toRoomId,
        lengthMeters: connection.lengthMeters.toString(),
        rackInfo: connection.rackInfo || '',
      });
    } else {
      setEditingConnection(null);
      setFormData({ fromRoomId: '', toRoomId: '', lengthMeters: '', rackInfo: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingConnection(null);
    setFormData({ fromRoomId: '', toRoomId: '', lengthMeters: '', rackInfo: '' });
  };

  const columns = [
    {
      key: 'fromRoom',
      label: 'From',
      render: (conn: any) => (
        <div className="font-medium">{conn.fromRoom?.systemId || '-'}</div>
      ),
    },
    {
      key: 'toRoom',
      label: 'To',
      render: (conn: any) => (
        <div className="font-medium">{conn.toRoom?.systemId || '-'}</div>
      ),
    },
    {
      key: 'lengthMeters',
      label: 'Distance',
      sortable: true,
      render: (conn: any) => `${conn.lengthMeters}m`,
    },
    {
      key: 'rackInfo',
      label: 'Rack Info',
      render: (conn: any) => (
        <span className="text-slate-600 text-sm">{conn.rackInfo || '-'}</span>
      ),
    },
  ];

  if (loading) {
    return <div className="text-center py-12 text-slate-600">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Connections</h2>
          <p className="text-slate-600 mt-1">Manage rack-to-rack connections</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary">
          <span className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Connection</span>
          </span>
        </button>
      </div>

      <Table
        data={connections}
        columns={columns}
        onEdit={openModal}
        onDelete={handleDelete}
        emptyMessage="No connections found. Add your first connection to get started."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingConnection ? 'Edit Connection' : 'Add Connection'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">From Room</label>
            <select
              value={formData.fromRoomId}
              onChange={(e) => setFormData({ ...formData, fromRoomId: e.target.value })}
              className="input-field"
              required
            >
              <option value="">Select Room</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.systemId}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">To Room</label>
            <select
              value={formData.toRoomId}
              onChange={(e) => setFormData({ ...formData, toRoomId: e.target.value })}
              className="input-field"
              required
            >
              <option value="">Select Room</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.systemId}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Distance (meters)</label>
            <input
              type="number"
              step="0.1"
              value={formData.lengthMeters}
              onChange={(e) => setFormData({ ...formData, lengthMeters: e.target.value })}
              className="input-field"
              placeholder="25"
              required
            />
          </div>
          <div>
            <label className="label">Rack Info (optional)</label>
            <input
              type="text"
              value={formData.rackInfo}
              onChange={(e) => setFormData({ ...formData, rackInfo: e.target.value })}
              className="input-field"
              placeholder="RackA-15 → RackB-23"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={closeModal} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingConnection ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
