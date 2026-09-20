import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { LineChart } from '../../components/charts/LineChart';
import { mockTableUsers } from '../../data/mockData';
import { Search, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import './DataInteractionPage.css';

export const DataInteractionPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [notifications] = useState([
    { id: '1', type: 'success', title: 'Export Complete', message: 'Theme tokens exported as JSON.', time: '2m ago' },
    { id: '2', type: 'warning', title: 'Contrast Notice', message: 'Text secondary fails WCAG AA on surface bg.', time: '15m ago' },
    { id: '3', type: 'error', title: 'Build Warning', message: 'Duplicate token key overridden.', time: '1h ago' }
  ]);

  const filteredUsers = mockTableUsers.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'All' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const toggleSelectRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  return (
    <div className="data-interaction-page">
      <div className="data-header">
        <h1 className="data-title">Data & Interaction Lab</h1>
        <p className="data-subtitle">
          Test interactive tables, charts, complex data structures, and notification overlays under the active style engine.
        </p>
      </div>

      {/* Interactive Table Section */}
      <Card className="table-card">
        <CardHeader>
          <CardTitle>User Management Table</CardTitle>
          <div className="table-actions">
            <Input
              placeholder="Search user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search size={16} />}
              style={{ width: '220px' }}
            />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="table-filter-select"
            >
              <option value="All">All Roles</option>
              <option value="Lead Designer">Lead Designer</option>
              <option value="Frontend Engineer">Frontend Engineer</option>
              <option value="Design Systems Arch">Design Systems Arch</option>
            </select>
          </div>
        </CardHeader>
        <CardBody>
          <div className="table-responsive">
            <table className="ui-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input
                      type="checkbox"
                      onChange={(e) =>
                        setSelectedRows(e.target.checked ? filteredUsers.map((u) => u.id) : [])
                      }
                      checked={selectedRows.length === filteredUsers.length && filteredUsers.length > 0}
                    />
                  </th>
                  <th>User Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Total Spent</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((usr) => (
                  <tr key={usr.id} className={selectedRows.includes(usr.id) ? 'ui-table__row--selected' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(usr.id)}
                        onChange={() => toggleSelectRow(usr.id)}
                      />
                    </td>
                    <td><strong>{usr.name}</strong></td>
                    <td>{usr.email}</td>
                    <td>{usr.role}</td>
                    <td>
                      <Badge
                        variant={usr.status === 'Active' ? 'success' : usr.status === 'Pending' ? 'warning' : 'outline'}
                        size="sm"
                      >
                        {usr.status}
                      </Badge>
                    </td>
                    <td>{usr.spent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Charts & Notification Center Row */}
      <div className="data-grid">
        <Card>
          <CardHeader>
            <CardTitle>Data Visualization Lab</CardTitle>
          </CardHeader>
          <CardBody>
            <LineChart
              data={[
                { label: 'Jan', value: 120 },
                { label: 'Feb', value: 240 },
                { label: 'Mar', value: 390 },
                { label: 'Apr', value: 510 },
                { label: 'May', value: 780 }
              ]}
              height={200}
            />
          </CardBody>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Center</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="notifications-list">
              {notifications.map((notif) => (
                <div key={notif.id} className={`notification-item notification-item--${notif.type}`}>
                  <div className="notification-icon">
                    {notif.type === 'success' && <CheckCircle2 size={18} />}
                    {notif.type === 'warning' && <AlertTriangle size={18} />}
                    {notif.type === 'error' && <XCircle size={18} />}
                  </div>
                  <div className="notification-content">
                    <strong className="notification-title">{notif.title}</strong>
                    <p className="notification-message">{notif.message}</p>
                  </div>
                  <span className="notification-time">{notif.time}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
