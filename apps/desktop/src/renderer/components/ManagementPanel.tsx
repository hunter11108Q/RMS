import React, { useState } from 'react';
import { TouchButton } from '@rms/ui';

// Mock dynamic roles and permissions list
const mockPermissions = [
  { module: 'POS', actions: ['pos:view', 'pos:create-bill', 'pos:cancel-bill', 'pos:refund-bill', 'pos:apply-discount', 'pos:open-cash-drawer'] },
  { module: 'Orders', actions: ['orders:view', 'orders:create', 'orders:update', 'orders:cancel', 'orders:split'] },
  { module: 'Kitchen', actions: ['kitchen:view-kot', 'kitchen:accept', 'kitchen:ready', 'kitchen:complete'] },
  { module: 'Inventory', actions: ['inventory:view', 'inventory:add-stock', 'inventory:edit-stock', 'inventory:purchase'] },
];

export const ManagementPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'shifts' | 'restaurant' | 'printers'>('users');

  // React State for User Management
  const [users, setUsers] = useState([
    { id: '1', name: 'Ritesh Kumar', username: 'ritesh_owner', role: 'Owner', designation: 'General Owner', status: 'ACTIVE' },
    { id: '2', name: 'Amit Sharma', username: 'amit_cashier', role: 'Cashier', designation: 'Lead Cashier', status: 'ACTIVE' },
    { id: '3', name: 'Pooja Patel', username: 'pooja_waiter', role: 'Waiter', designation: 'Senior Server', status: 'ACTIVE' },
  ]);
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('Cashier');

  // React State for Shift Log
  const [isShiftOpen, setIsShiftOpen] = useState(false);
  const [openingCash, setOpeningCash] = useState('1000');
  const [shiftLogs, setShiftLogs] = useState<any[]>([]);

  // React State for Permissions Matrix
  const [selectedRole, setSelectedRole] = useState('Cashier');
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({
    Owner: ['*'],
    Cashier: ['pos:view', 'pos:create-bill', 'pos:open-cash-drawer', 'orders:view'],
    Waiter: ['orders:view', 'orders:create', 'orders:update'],
  });

  // React State for Restaurant Profile
  const [restaurantProfile, setRestaurantProfile] = useState({
    name: 'Taste of India',
    legalName: 'Taste of India Resto Pvt Ltd',
    gstNumber: '27AAAAA1111A1Z1',
    fssaiLicense: '12345678901234',
    address: '123 VIP Road, Bangalore, Karnataka',
    currency: 'INR (₹)',
    timeZone: 'Asia/Kolkata',
    restaurantType: 'Fine Dine Restaurant',
  });

  // React State for Printers
  const [printers, setPrinters] = useState([
    { id: '1', name: 'Billing Printer', type: 'BILLING', paperSize: '80mm', connectionType: 'LAN', ipAddress: '192.168.1.200' },
    { id: '2', name: 'Kitchen KOT Printer', type: 'KITCHEN', paperSize: '80mm', connectionType: 'LAN', ipAddress: '192.168.1.201' },
  ]);
  const [newPrinterName, setNewPrinterName] = useState('');
  const [newPrinterType, setNewPrinterType] = useState('KITCHEN');
  const [newPrinterIp, setNewPrinterIp] = useState('');

  const handleAddUser = () => {
    if (!newUserName) return;
    setUsers([
      ...users,
      {
        id: (users.length + 1).toString(),
        name: newUserName,
        username: newUserName.toLowerCase().replace(' ', '_'),
        role: newUserRole,
        designation: `${newUserRole} operator`,
        status: 'ACTIVE',
      },
    ]);
    setNewUserName('');
  };

  const handleTogglePermission = (role: string, action: string) => {
    const current = rolePermissions[role] || [];
    const updated = current.includes(action)
      ? current.filter((a) => a !== action)
      : [...current, action];
    setRolePermissions({ ...rolePermissions, [role]: updated });
  };

  const handleToggleShift = () => {
    if (isShiftOpen) {
      const closing = parseFloat(openingCash) + 500;
      setShiftLogs([
        ...shiftLogs,
        {
          id: (shiftLogs.length + 1).toString(),
          openedAt: new Date(Date.now() - 8 * 3600 * 1000).toLocaleString(),
          closedAt: new Date().toLocaleString(),
          openingCash: parseFloat(openingCash),
          closingCash: closing,
          expectedCash: parseFloat(openingCash) + 500,
          difference: 0,
        },
      ]);
      setIsShiftOpen(false);
    } else {
      setIsShiftOpen(true);
    }
  };

  const handleAddPrinter = () => {
    if (!newPrinterName) return;
    setPrinters([
      ...printers,
      {
        id: (printers.length + 1).toString(),
        name: newPrinterName,
        type: newPrinterType,
        paperSize: '80mm',
        connectionType: 'LAN',
        ipAddress: newPrinterIp || '192.168.1.202',
      },
    ]);
    setNewPrinterName('');
    setNewPrinterIp('');
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'Inter, sans-serif', color: '#1E293B', backgroundColor: '#F8FAFC', minHeight: '80vh' }}>
      <h1 style={{ fontSize: '28px', fontFamily: 'Outfit, sans-serif', fontWeight: 'bold', marginBottom: '24px' }}>
        System Administration & Settings
      </h1>

      {/* Tabs Selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px', flexWrap: 'wrap' }}>
        {(['users', 'roles', 'shifts', 'restaurant', 'printers'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === tab ? '#3B82F6' : 'transparent',
              color: activeTab === tab ? '#FFFFFF' : '#475569',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              minHeight: '44px',
              textTransform: 'capitalize',
            }}
          >
            {tab === 'users' ? 'User Accounts' : tab === 'roles' ? 'Roles & Permissions' : tab === 'shifts' ? 'Shift balancing' : tab}
          </button>
        ))}
      </div>

      {/* User Accounts Tab */}
      {activeTab === 'users' && (
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: 'bold' }}>Active Team Members</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0', textAlign: 'left', color: '#475569' }}>
                <th style={{ padding: '12px' }}>Name</th>
                <th style={{ padding: '12px' }}>Username</th>
                <th style={{ padding: '12px' }}>Role</th>
                <th style={{ padding: '12px' }}>Designation</th>
                <th style={{ padding: '12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{u.name}</td>
                  <td style={{ padding: '12px' }}>@{u.username}</td>
                  <td style={{ padding: '12px' }}>{u.role}</td>
                  <td style={{ padding: '12px' }}>{u.designation}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ backgroundColor: '#DCFCE7', color: '#15803D', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>Register New Team Member</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Full Name"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', minWidth: '200px', minHeight: '44px' }}
              />
              <select
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', minWidth: '150px', minHeight: '44px' }}
              >
                <option value="Manager">Manager</option>
                <option value="Cashier">Cashier</option>
                <option value="Waiter">Waiter</option>
                <option value="Kitchen Staff">Kitchen Staff</option>
              </select>
              <TouchButton label="Add User" onPress={handleAddUser} />
            </div>
          </div>
        </div>
      )}

      {/* Roles & Permissions Tab */}
      {activeTab === 'roles' && (
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Permission Matrix</h2>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', minWidth: '150px', minHeight: '44px' }}
            >
              <option value="Owner">Owner</option>
              <option value="Cashier">Cashier</option>
              <option value="Waiter">Waiter</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {mockPermissions.map((mod) => (
              <div key={mod.module} style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px' }}>
                <h3 style={{ fontWeight: 'bold', color: '#475569', marginBottom: '12px' }}>{mod.module} Actions</h3>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  {mod.actions.map((act) => {
                    const isChecked = rolePermissions[selectedRole]?.includes(act) || rolePermissions[selectedRole]?.includes('*');
                    return (
                      <label key={act} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', minHeight: '44px' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={rolePermissions[selectedRole]?.includes('*')}
                          onChange={() => handleTogglePermission(selectedRole, act)}
                          style={{ width: '20px', height: '20px' }}
                        />
                        <span>{act}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shift Balancing Tab */}
      {activeTab === 'shifts' && (
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: 'bold' }}>Shift & Till Balancing</h2>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '32px', backgroundColor: '#F8FAFC', padding: '20px', borderRadius: '8px' }}>
            <div>
              <span style={{ fontSize: '14px', color: '#64748B', display: 'block' }}>Current Shift Status</span>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: isShiftOpen ? '#15803D' : '#B91C1C' }}>
                {isShiftOpen ? 'ACTIVE / OPENED' : 'INACTIVE / CLOSED'}
              </span>
            </div>
            {isShiftOpen ? (
              <TouchButton label="Close Active Shift" variant="accent" onPress={handleToggleShift} />
            ) : (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="number"
                  placeholder="Opening Cash"
                  value={openingCash}
                  onChange={(e) => setOpeningCash(e.target.value)}
                  style={{ padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', maxWidth: '120px', minHeight: '44px' }}
                />
                <TouchButton label="Open Shift" onPress={handleToggleShift} />
              </div>
            )}
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>Shift Logs Archives</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0', textAlign: 'left', color: '#475569' }}>
                <th style={{ padding: '12px' }}>Opened At</th>
                <th style={{ padding: '12px' }}>Closed At</th>
                <th style={{ padding: '12px' }}>Opening Balance</th>
                <th style={{ padding: '12px' }}>Closing Balance</th>
                <th style={{ padding: '12px' }}>Difference</th>
              </tr>
            </thead>
            <tbody>
              {shiftLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#64748B' }}>
                    No shift closures recorded in this session.
                  </td>
                </tr>
              ) : (
                shiftLogs.map((l) => (
                  <tr key={l.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px' }}>{l.openedAt}</td>
                    <td style={{ padding: '12px' }}>{l.closedAt}</td>
                    <td style={{ padding: '12px' }}>₹{l.openingCash}</td>
                    <td style={{ padding: '12px' }}>₹{l.closingCash}</td>
                    <td style={{ padding: '12px', color: l.difference === 0 ? '#15803D' : '#B91C1C', fontWeight: 'bold' }}>
                      ₹{l.difference}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Restaurant Profile Tab */}
      {activeTab === 'restaurant' && (
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: 'bold' }}>Global Identity & Profile</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div>
              <label style={{ fontSize: '14px', color: '#64748B', display: 'block', marginBottom: '4px' }}>Restaurant Name</label>
              <input
                type="text"
                value={restaurantProfile.name}
                onChange={(e) => setRestaurantProfile({ ...restaurantProfile, name: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', minHeight: '44px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '14px', color: '#64748B', display: 'block', marginBottom: '4px' }}>GSTIN Number</label>
              <input
                type="text"
                value={restaurantProfile.gstNumber}
                onChange={(e) => setRestaurantProfile({ ...restaurantProfile, gstNumber: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', minHeight: '44px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '14px', color: '#64748B', display: 'block', marginBottom: '4px' }}>FSSAI License No.</label>
              <input
                type="text"
                value={restaurantProfile.fssaiLicense}
                onChange={(e) => setRestaurantProfile({ ...restaurantProfile, fssaiLicense: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', minHeight: '44px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '14px', color: '#64748B', display: 'block', marginBottom: '4px' }}>Base Address</label>
              <input
                type="text"
                value={restaurantProfile.address}
                onChange={(e) => setRestaurantProfile({ ...restaurantProfile, address: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', minHeight: '44px' }}
              />
            </div>
          </div>
          <TouchButton label="Save Changes" onPress={() => alert('Profile updated placeholder')} />
        </div>
      )}

      {/* Printers Configuration Tab */}
      {activeTab === 'printers' && (
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: 'bold' }}>Active Hardware Printers</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0', textAlign: 'left', color: '#475569' }}>
                <th style={{ padding: '12px' }}>Name</th>
                <th style={{ padding: '12px' }}>Type</th>
                <th style={{ padding: '12px' }}>Paper Size</th>
                <th style={{ padding: '12px' }}>Connection</th>
                <th style={{ padding: '12px' }}>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {printers.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{p.name}</td>
                  <td style={{ padding: '12px' }}>{p.type}</td>
                  <td style={{ padding: '12px' }}>{p.paperSize}</td>
                  <td style={{ padding: '12px' }}>{p.connectionType}</td>
                  <td style={{ padding: '12px' }}>{p.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>Register Hardware Printer</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Printer Name"
                value={newPrinterName}
                onChange={(e) => setNewPrinterName(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', minWidth: '200px', minHeight: '44px' }}
              />
              <select
                value={newPrinterType}
                onChange={(e) => setNewPrinterType(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', minWidth: '150px', minHeight: '44px' }}
              >
                <option value="KITCHEN">Kitchen (KOT)</option>
                <option value="BILLING">Billing (Counter)</option>
                <option value="BAR">Bar</option>
              </select>
              <input
                type="text"
                placeholder="IP Address (LAN)"
                value={newPrinterIp}
                onChange={(e) => setNewPrinterIp(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', minWidth: '150px', minHeight: '44px' }}
              />
              <TouchButton label="Add Printer" onPress={handleAddPrinter} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagementPanel;
