import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Button from '../components/Button.jsx';
import EditUserModal from '../components/EditUserModal.jsx';
import '../App.css';

function AdminDashboardPage() {
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in as an admin.');
      return;
    }
    try {
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      const [statsResponse, employeesResponse] = await Promise.all([
        axios.get('http://localhost:8080/api/admin/stats', config),
        axios.get('http://localhost:8080/api/admin/employees', config)
      ]);
      setStats(statsResponse.data);
      setEmployees(employeesResponse.data);
    } catch (err) {
      setError('Failed to fetch admin data.');
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUserUpdate = async (userId, updateData) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`http://localhost:8080/api/admin/employees/${userId}`, updateData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('User updated successfully!');
      setSelectedUser(null);
      fetchData();
    } catch (error) {
      alert('Failed to update user.');
      console.error('Error updating user:', error);
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Admin Dashboard</h1>
      {error && <p style={{color: 'red'}}>{error}</p>}
      
      <h2>Overview</h2>
      <div className="stats-container">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p>{stats ? stats.totalUsers : 'Loading...'}</p>
        </div>
        <div className="stat-card">
          <h3>Total Rides</h3>
          <p>{stats ? stats.totalRides : 'Loading...'}</p>
        </div>
      </div>

      <h2>All Employees</h2>
      <table className="employee-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Travel Credit</th>
            <th>Rides Traveled</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(employee => (
            <tr key={employee.id}>
              <td>{employee.id}</td>
              <td>{employee.name}</td>
              <td>{employee.email}</td>
              <td>{employee.role}</td>
              <td>{employee.travelCredit.toFixed(2)}</td>
              <td>{employee.ridesTraveled}</td>
              <td>
                <Button onClick={() => setSelectedUser(employee)}>Edit</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {selectedUser && (
        <EditUserModal 
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUserUpdate={handleUserUpdate}
        />
      )}
    </div>
  );
}

export default AdminDashboardPage;