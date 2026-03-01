'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import Table from './Table';
import type { Building } from '@/types';

export default function BuildingsManager() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [formData, setFormData] = useState({
    ibxCode: '',
    name: '',
    city: '',
    country: '',
  });

  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    try {
      const response = await fetch('/api/buildings');
      const data = await response.json();
      if (data.success) {
        setBuildings(data.buildings);
      }
    } catch (error) {
      console.error('Failed to fetch buildings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingBuilding ? `/api/buildings/${editingBuilding.id}` : '/api/buildings';
    const method = editingBuilding ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchBuildings();
        closeModal();
      }
    } catch (error) {
      console.error('Failed to save building:', error);
    }
  };

  const handleDelete = async (building: Building) => {
    if (!confirm(`Delete building "${building.name}"?`)) return;

    try {
      const response = await fetch(`/api/buildings/${building.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchBuildings();
      }
    } catch (error) {
      console.error('Failed to delete building:', error);
    }
  };

  const openModal = (building?: Building) => {
    if (building) {
      setEditingBuilding(building);
      setFormData({
        ibxCode: building.ibxCode,
        name: building.name,
        city: '',
        country: '',
      });
    } else {
      setEditingBuilding(null);
      setFormData({ ibxCode: '', name: '', city: '', country: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBuilding(null);
    setFormData({ ibxCode: '', name: '', city: '', country: '' });
  };

  const columns = [
    { key: 'ibxCode', label: 'IBX Code', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
  ];

  if (loading) {
    return <div className="text-center py-12 text-slate-600">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Buildings</h2>
          <p className="text-slate-600 mt-1">Manage data center locations</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary">
          <span className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Building</span>
          </span>
        </button>
      </div>

      <Table
        data={buildings}
        columns={columns}
        onEdit={openModal}
        onDelete={handleDelete}
        emptyMessage="No buildings found. Add your first building to get started."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingBuilding ? 'Edit Building' : 'Add Building'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">IBX Code</label>
            <input
              type="text"
              value={formData.ibxCode}
              onChange={(e) => setFormData({ ...formData, ibxCode: e.target.value })}
              className="input-field"
              placeholder="FR2, MU1, etc."
              required
            />
          </div>
          <div>
            <label className="label">Building Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="Frankfurt 2"
              required
            />
          </div>
          <div>
            <label className="label">City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="input-field"
              placeholder="Frankfurt"
            />
          </div>
          <div>
            <label className="label">Country</label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="input-field"
              placeholder="Germany"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={closeModal} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingBuilding ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
