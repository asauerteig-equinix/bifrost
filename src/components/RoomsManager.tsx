'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import Table from './Table';
import type { Room, Building } from '@/types';

export default function RoomsManager() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    systemId: '',
    buildingId: '',
    floor: '',
    roomName: '',
    type: 'NORMAL' as 'NORMAL' | 'BACKBONE',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [roomsRes, buildingsRes] = await Promise.all([
        fetch('/api/rooms'),
        fetch('/api/buildings'),
      ]);
      const roomsData = await roomsRes.json();
      const buildingsData = await buildingsRes.json();

      if (roomsData.success) setRooms(roomsData.rooms);
      if (buildingsData.success) setBuildings(buildingsData.buildings);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingRoom ? `/api/rooms/${editingRoom.id}` : '/api/rooms';
    const method = editingRoom ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchData();
        closeModal();
      }
    } catch (error) {
      console.error('Failed to save room:', error);
    }
  };

  const handleDelete = async (room: any) => {
    if (!confirm(`Delete room "${room.systemId}"?`)) return;

    try {
      const response = await fetch(`/api/rooms/${room.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to delete room:', error);
    }
  };

  const openModal = (room?: any) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        systemId: room.systemId,
        buildingId: room.buildingId,
        floor: room.floor,
        roomName: room.roomNumber,
        type: room.type,
      });
    } else {
      setEditingRoom(null);
      setFormData({ systemId: '', buildingId: '', floor: '', roomName: '', type: 'NORMAL' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRoom(null);
    setFormData({ systemId: '', buildingId: '', floor: '', roomName: '', type: 'NORMAL' });
  };

  const columns = [
    { key: 'systemId', label: 'System ID', sortable: true },
    {
      key: 'building',
      label: 'Building',
      render: (room: any) => room.building?.name || '-',
    },
    { key: 'floor', label: 'Floor', sortable: true },
    { key: 'roomNumber', label: 'Room', sortable: true },
    {
      key: 'type',
      label: 'Type',
      render: (room: any) => (
        <span className={`badge ${room.type === 'BACKBONE' ? 'badge-backbone' : 'badge-normal'}`}>
          {room.type}
        </span>
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
          <h2 className="text-2xl font-bold text-slate-900">Rooms</h2>
          <p className="text-slate-600 mt-1">Manage rooms and cages within buildings</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary">
          <span className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Room</span>
          </span>
        </button>
      </div>

      <Table
        data={rooms}
        columns={columns}
        onEdit={openModal}
        onDelete={handleDelete}
        emptyMessage="No rooms found. Add your first room to get started."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingRoom ? 'Edit Room' : 'Add Room'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">System ID</label>
            <input
              type="text"
              value={formData.systemId}
              onChange={(e) => setFormData({ ...formData, systemId: e.target.value })}
              className="input-field"
              placeholder="FR2:01:50900"
              required
            />
            <p className="text-xs text-slate-500 mt-1">Format: IBX:FLOOR:ROOM</p>
          </div>
          <div>
            <label className="label">Building</label>
            <select
              value={formData.buildingId}
              onChange={(e) => setFormData({ ...formData, buildingId: e.target.value })}
              className="input-field"
              required
            >
              <option value="">Select Building</option>
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.ibxCode} - {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Floor</label>
            <input
              type="text"
              value={formData.floor}
              onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
              className="input-field"
              placeholder="01, UG, etc."
              required
            />
          </div>
          <div>
            <label className="label">Room Name</label>
            <input
              type="text"
              value={formData.roomName}
              onChange={(e) => setFormData({ ...formData, roomName: e.target.value })}
              className="input-field"
              placeholder="50900, NSE-01, etc."
              required
            />
          </div>
          <div>
            <label className="label">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'NORMAL' | 'BACKBONE' })}
              className="input-field"
              required
            >
              <option value="NORMAL">Normal (Customer Cage)</option>
              <option value="BACKBONE">Backbone (Meet-Me Room)</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={closeModal} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingRoom ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
