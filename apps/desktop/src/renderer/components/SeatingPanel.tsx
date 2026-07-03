import React, { useState } from 'react';
import { TouchButton } from '@rms/ui';

export const SeatingPanel: React.FC = () => {
  const [activeFloor, setActiveFloor] = useState<'ground' | 'outdoor' | 'vip'>('ground');
  const [seatingMode, setSeatingMode] = useState<'floor' | 'reservations' | 'waitlist'>('floor');

  // React State for Restaurant Tables
  const [tables, setTables] = useState([
    { id: '1', floor: 'ground', number: 'T1', capacity: 4, type: 'SQUARE', status: 'AVAILABLE', posX: 50, posY: 50 },
    { id: '2', floor: 'ground', number: 'T2', capacity: 2, type: 'ROUND', status: 'OCCUPIED', posX: 180, posY: 50 },
    { id: '3', floor: 'ground', number: 'T3', capacity: 6, type: 'RECTANGLE', status: 'BILLING_REQUESTED', posX: 310, posY: 50 },
    { id: '4', floor: 'outdoor', number: 'O1', capacity: 4, type: 'ROUND', status: 'AVAILABLE', posX: 100, posY: 100 },
    { id: '5', floor: 'vip', number: 'V1', capacity: 8, type: 'BOOTH', status: 'RESERVED', posX: 150, posY: 150 },
  ]);

  // React State for Reservations
  const [reservations, setReservations] = useState([
    { id: '1', customerName: 'Ritesh Kumar', customerPhone: '9988776655', guestsCount: 4, date: '2026-06-30', time: '19:30', status: 'CONFIRMED' },
    { id: '2', customerName: 'Ananya Sharma', customerPhone: '9911223344', guestsCount: 2, date: '2026-06-30', time: '20:00', status: 'PENDING' },
  ]);
  const [newResName, setNewResName] = useState('');
  const [newResPhone, setNewResPhone] = useState('');
  const [newResGuests, setNewResGuests] = useState('2');

  // React State for Waitlist
  const [waitlist, setWaitlist] = useState([
    { id: '1', customerName: 'Vikram Singh', guestsCount: 3, estimatedWait: 20 },
    { id: '2', customerName: 'Sneha Patil', guestsCount: 5, estimatedWait: 35 },
  ]);
  const [newWaitName, setNewWaitName] = useState('');
  const [newWaitGuests, setNewWaitGuests] = useState('4');

  const handleTableClick = (tableId: string) => {
    // Toggle table status in real time
    setTables(
      tables.map((t) => {
        if (t.id === tableId) {
          const nextStatus =
            t.status === 'AVAILABLE'
              ? 'OCCUPIED'
              : t.status === 'OCCUPIED'
              ? 'BILLING_REQUESTED'
              : 'AVAILABLE';
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  const handleAddReservation = () => {
    if (!newResName || !newResPhone) return;
    setReservations([
      ...reservations,
      {
        id: (reservations.length + 1).toString(),
        customerName: newResName,
        customerPhone: newResPhone,
        guestsCount: parseInt(newResGuests),
        date: '2026-06-30',
        time: '20:30',
        status: 'CONFIRMED',
      },
    ]);
    setNewResName('');
    setNewResPhone('');
  };

  const handleAddWaitlist = () => {
    if (!newWaitName) return;
    setWaitlist([
      ...waitlist,
      {
        id: (waitlist.length + 1).toString(),
        customerName: newWaitName,
        guestsCount: parseInt(newWaitGuests),
        estimatedWait: 15,
      },
    ]);
    setNewWaitName('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return '#22C55E'; // green
      case 'OCCUPIED':
        return '#EF4444'; // red
      case 'RESERVED':
        return '#3B82F6'; // blue
      case 'BILLING_REQUESTED':
        return '#F59E0B'; // orange
      default:
        return '#64748B';
    }
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'Inter, sans-serif', color: '#1E293B', backgroundColor: '#F8FAFC', minHeight: '80vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontFamily: 'Outfit, sans-serif', fontWeight: 'bold' }}>
          Floor Plan & Seating Status
        </h1>

        {/* Mode Selector */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setSeatingMode('floor')}
            style={{
              padding: '8px 16px',
              backgroundColor: seatingMode === 'floor' ? '#1E3A8A' : 'transparent',
              color: seatingMode === 'floor' ? '#FFFFFF' : '#475569',
              border: '1px solid #1E3A8A',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              minHeight: '44px',
            }}
          >
            Live Floor Plan
          </button>
          <button
            onClick={() => setSeatingMode('reservations')}
            style={{
              padding: '8px 16px',
              backgroundColor: seatingMode === 'reservations' ? '#1E3A8A' : 'transparent',
              color: seatingMode === 'reservations' ? '#FFFFFF' : '#475569',
              border: '1px solid #1E3A8A',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              minHeight: '44px',
            }}
          >
            Reservations
          </button>
          <button
            onClick={() => setSeatingMode('waitlist')}
            style={{
              padding: '8px 16px',
              backgroundColor: seatingMode === 'waitlist' ? '#1E3A8A' : 'transparent',
              color: seatingMode === 'waitlist' ? '#FFFFFF' : '#475569',
              border: '1px solid #1E3A8A',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              minHeight: '44px',
            }}
          >
            Walk-in Waitlist
          </button>
        </div>
      </header>

      {/* Live Floor Map view */}
      {seatingMode === 'floor' && (
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {/* Floor selection side tab */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '150px' }}>
            <button
              onClick={() => setActiveFloor('ground')}
              style={{
                padding: '12px',
                textAlign: 'left',
                backgroundColor: activeFloor === 'ground' ? '#EFF6FF' : '#FFFFFF',
                color: activeFloor === 'ground' ? '#1E3A8A' : '#475569',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Ground Floor AC
            </button>
            <button
              onClick={() => setActiveFloor('outdoor')}
              style={{
                padding: '12px',
                textAlign: 'left',
                backgroundColor: activeFloor === 'outdoor' ? '#EFF6FF' : '#FFFFFF',
                color: activeFloor === 'outdoor' ? '#1E3A8A' : '#475569',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Outdoor Garden
            </button>
            <button
              onClick={() => setActiveFloor('vip')}
              style={{
                padding: '12px',
                textAlign: 'left',
                backgroundColor: activeFloor === 'vip' ? '#EFF6FF' : '#FFFFFF',
                color: activeFloor === 'vip' ? '#1E3A8A' : '#475569',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              VIP Lounge
            </button>
          </div>

          {/* Visual Canvas designer area */}
          <div style={{ flex: 1, minWidth: '400px', height: '400px', backgroundColor: '#FFFFFF', border: '1px dashed #CBD5E1', borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
            {tables
              .filter((t) => t.floor === activeFloor)
              .map((table) => {
                const borderRad = table.type === 'ROUND' ? '50%' : '8px';
                return (
                  <div
                    key={table.id}
                    onClick={() => handleTableClick(table.id)}
                    style={{
                      position: 'absolute',
                      left: `${table.posX}px`,
                      top: `${table.posY}px`,
                      width: '90px',
                      height: '90px',
                      borderRadius: borderRad,
                      backgroundColor: getStatusColor(table.status),
                      color: '#FFFFFF',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{table.number}</span>
                    <span style={{ fontSize: '11px' }}>Pax: {table.capacity}</span>
                    <span style={{ fontSize: '10px', textTransform: 'capitalize', opacity: 0.8 }}>
                      {table.status.replace('_', ' ').toLowerCase()}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Reservations scheduling logs tab */}
      {seatingMode === 'reservations' && (
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: 'bold' }}>Calendar Bookings</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0', textAlign: 'left', color: '#475569' }}>
                <th style={{ padding: '12px' }}>Customer</th>
                <th style={{ padding: '12px' }}>Phone</th>
                <th style={{ padding: '12px' }}>Guests</th>
                <th style={{ padding: '12px' }}>Timeslot</th>
                <th style={{ padding: '12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((res) => (
                <tr key={res.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{res.customerName}</td>
                  <td style={{ padding: '12px' }}>{res.customerPhone}</td>
                  <td style={{ padding: '12px' }}>{res.guestsCount} guests</td>
                  <td style={{ padding: '12px' }}>{res.date} @ {res.time}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ backgroundColor: '#DBEAFE', color: '#1E40AF', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                      {res.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>Book Reservation Slot</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Customer Name"
                value={newResName}
                onChange={(e) => setNewResName(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', minWidth: '200px', minHeight: '44px' }}
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={newResPhone}
                onChange={(e) => setNewResPhone(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', minWidth: '150px', minHeight: '44px' }}
              />
              <input
                type="number"
                placeholder="Guests"
                value={newResGuests}
                onChange={(e) => setNewResGuests(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', maxWidth: '80px', minHeight: '44px' }}
              />
              <TouchButton label="Book Slot" onPress={handleAddReservation} />
            </div>
          </div>
        </div>
      )}

      {/* Walk-in Waitlist queues tab */}
      {seatingMode === 'waitlist' && (
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: 'bold' }}>Walk-in Queues</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0', textAlign: 'left', color: '#475569' }}>
                <th style={{ padding: '12px' }}>Customer Name</th>
                <th style={{ padding: '12px' }}>Guests</th>
                <th style={{ padding: '12px' }}>Est. Waiting Time</th>
                <th style={{ padding: '12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {waitlist.map((w) => (
                <tr key={w.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{w.customerName}</td>
                  <td style={{ padding: '12px' }}>{w.guestsCount} guests</td>
                  <td style={{ padding: '12px' }}>{w.estimatedWait} mins</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ backgroundColor: '#FEF3C7', color: '#D97706', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                      WAITING
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>Register Queue Walk-in</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Customer Name"
                value={newWaitName}
                onChange={(e) => setNewWaitName(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', minWidth: '200px', minHeight: '44px' }}
              />
              <input
                type="number"
                placeholder="Guests"
                value={newWaitGuests}
                onChange={(e) => setNewWaitGuests(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', maxWidth: '80px', minHeight: '44px' }}
              />
              <TouchButton label="Queue Waitlist" onPress={handleAddWaitlist} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatingPanel;
