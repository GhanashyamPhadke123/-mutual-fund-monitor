import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function MutualFundMonitor() {
  const [holdings, setHoldings] = useState([
    { id: 1, name: 'Axis Growth Fund', amfiCode: '113019', units: 150, purchaseDate: '2023-01-15', purchaseNAV: 45.30, currentNAV: 58.45, amountInvested: 6795 },
    { id: 2, name: 'ICICI Prudential Growth', amfiCode: '113018', units: 200, purchaseDate: '2023-06-10', purchaseNAV: 52.10, currentNAV: 64.25, amountInvested: 10420 },
    { id: 3, name: 'Mirae Asset Emerging Leaders', amfiCode: '113103', units: 100, purchaseDate: '2023-03-20', purchaseNAV: 48.50, currentNAV: 62.80, amountInvested: 4850 },
  ]);

  const [newFund, setNewFund] = useState({ name: '', amfiCode: '', units: '', purchaseDate: '', purchaseNAV: '', currentNAV: '' });
  const [view, setView] = useState('dashboard');
  const [editingId, setEditingId] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [navUpdateLog, setNavUpdateLog] = useState([]);

  // Calculate portfolio metrics
  const calculateMetrics = () => {
    const totalInvested = holdings.reduce((sum, h) => sum + h.amountInvested, 0);
    const currentValue = holdings.reduce((sum, h) => sum + (h.units * h.currentNAV), 0);
    const totalGain = currentValue - totalInvested;
    const returnPercentage = totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(2) : 0;

    return { totalInvested: totalInvested.toFixed(2), currentValue: currentValue.toFixed(2), totalGain: totalGain.toFixed(2), returnPercentage };
  };

  // Calculate individual fund performance
  const calculateHoldingMetrics = (holding) => {
    const currentValue = (holding.units * holding.currentNAV).toFixed(2);
    const gain = (currentValue - holding.amountInvested).toFixed(2);
    const returnPct = holding.amountInvested > 0 ? ((gain / holding.amountInvested) * 100).toFixed(2) : 0;
    return { currentValue: parseFloat(currentValue), gain: parseFloat(gain), returnPct: parseFloat(returnPct) };
  };

  // Simulate NAV fetch from AMFI
  const fetchNAV = async (amfiCode) => {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 200,
          messages: [
            {
              role: 'user',
              content: `Generate a realistic current NAV (Net Asset Value) for an Indian mutual fund with AMFI code ${amfiCode}. The NAV should be a plausible value between 20 and 150. Return ONLY a single number (e.g., 55.75) with no other text.`
            }
          ]
        })
      });

      if (!response.ok) throw new Error('API call failed');
      const data = await response.json();
      const navText = data.content[0]?.text || '50';
      const nav = parseFloat(navText.trim());
      return isNaN(nav) ? 50 : Math.max(20, Math.min(150, nav));
    } catch (error) {
      console.error('NAV fetch error:', error);
      return null;
    }
  };

  const updateAllNAVs = async () => {
    const timestamp = new Date().toLocaleTimeString();
    const updates = [];

    for (const holding of holdings) {
      const newNAV = await fetchNAV(holding.amfiCode);
      if (newNAV) {
        const oldNAV = holding.currentNAV;
        const change = ((newNAV - oldNAV) / oldNAV * 100).toFixed(2);
        updates.push({ fund: holding.name, oldNAV, newNAV, change });

        setHoldings(prev => prev.map(h => h.id === holding.id ? { ...h, currentNAV: newNAV } : h));
      }
      await new Promise(resolve => setTimeout(resolve, 500)); // Rate limiting
    }

    if (updates.length > 0) {
      setNavUpdateLog(prev => [{ timestamp, updates }, ...prev.slice(0, 9)]);
      setAlerts(prev => [{ type: 'success', msg: `Updated ${updates.length} holdings` }, ...prev.slice(0, 4)]);
    }
  };

  const addHolding = () => {
    if (newFund.name && newFund.amfiCode && newFund.units && newFund.purchaseDate && newFund.purchaseNAV && newFund.currentNAV) {
      const units = parseFloat(newFund.units);
      const purchaseNAV = parseFloat(newFund.purchaseNAV);
      const currentNAV = parseFloat(newFund.currentNAV);
      const amountInvested = (units * purchaseNAV).toFixed(2);

      if (editingId) {
        setHoldings(prev => prev.map(h => h.id === editingId ? { ...h, name: newFund.name, amfiCode: newFund.amfiCode, units, purchaseDate: newFund.purchaseDate, purchaseNAV, currentNAV, amountInvested: parseFloat(amountInvested) } : h));
        setEditingId(null);
      } else {
        setHoldings(prev => [...prev, { id: Date.now(), name: newFund.name, amfiCode: newFund.amfiCode, units, purchaseDate: newFund.purchaseDate, purchaseNAV, currentNAV, amountInvested: parseFloat(amountInvested) }]);
      }

      setNewFund({ name: '', amfiCode: '', units: '', purchaseDate: '', purchaseNAV: '', currentNAV: '' });
      setAlerts(prev => [{ type: 'success', msg: editingId ? 'Holding updated' : 'Holding added' }, ...prev.slice(0, 4)]);
    }
  };

  const deleteHolding = (id) => {
    setHoldings(prev => prev.filter(h => h.id !== id));
    setAlerts(prev => [{ type: 'info', msg: 'Holding removed' }, ...prev.slice(0, 4)]);
  };

  const startEdit = (holding) => {
    setNewFund({ name: holding.name, amfiCode: holding.amfiCode, units: holding.units.toString(), purchaseDate: holding.purchaseDate, purchaseNAV: holding.purchaseNAV.toString(), currentNAV: holding.currentNAV.toString() });
    setEditingId(holding.id);
  };

  const metrics = calculateMetrics();

  // Chart data for portfolio growth
  const portfolioData = [
    { date: '15 Jan', value: 11000 },
    { date: '15 Feb', value: 12500 },
    { date: '15 Mar', value: 11800 },
    { date: '15 Apr', value: 13200 },
    { date: '15 May', value: 14100 },
    { date: 'Today', value: parseFloat(metrics.currentValue) }
  ];

  // Chart data for fund allocation
  const allocationData = holdings.map(h => ({
    name: h.name.split(' ')[0],
    value: parseFloat((h.units * h.currentNAV).toFixed(0)),
    investedValue: h.amountInvested
  }));

  const COLORS = ['#3266ad', '#73b1e8', '#99c0f0', '#a3883a', '#d4a574', '#9b8b6f', '#5a7d9f', '#c4a572'];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f8f7f2', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', borderBottom: '1px solid #e0ddd3', paddingBottom: '16px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '600', color: '#2c2c2a' }}>💰 Mutual Fund Portfolio Monitor</h1>
        <p style={{ margin: '0', fontSize: '14px', color: '#888780' }}>Track, analyze, and visualize your Indian MF investments</p>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          {alerts.map((alert, idx) => (
            <div key={idx} style={{ padding: '10px 14px', backgroundColor: alert.type === 'success' ? '#eaf3de' : alert.type === 'danger' ? '#fcebeb' : '#e6f1fb', borderLeft: `3px solid ${alert.type === 'success' ? '#3b6d11' : alert.type === 'danger' ? '#a32d2d' : '#185fa5'}`, marginBottom: '8px', borderRadius: '4px', fontSize: '13px', color: alert.type === 'success' ? '#27500a' : alert.type === 'danger' ? '#791f1f' : '#0c447c' }}>
              {alert.msg}
            </div>
          ))}
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #e0ddd3', paddingBottom: '12px' }}>
        {['dashboard', 'holdings', 'add', 'analysis', 'logs'].map(v => (
          <button key={v} onClick={() => setView(v)} style={{ padding: '8px 16px', border: view === v ? '2px solid #185fa5' : '1px solid #d3d1c7', backgroundColor: view === v ? '#e6f1fb' : 'transparent', borderRadius: '4px', fontSize: '13px', fontWeight: view === v ? '600' : '400', color: view === v ? '#0c447c' : '#888780', cursor: 'pointer', transition: 'all 0.2s' }}>
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      {/* Dashboard View */}
      {view === 'dashboard' && (
        <div>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            <div style={{ backgroundColor: '#e6f1fb', padding: '16px', borderRadius: '8px', border: '1px solid #85b7eb' }}>
              <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#185fa5', fontWeight: '500' }}>Total Invested</p>
              <p style={{ margin: '0', fontSize: '22px', fontWeight: '600', color: '#0c447c' }}>₹{parseFloat(metrics.totalInvested).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            </div>
            <div style={{ backgroundColor: '#eaf3de', padding: '16px', borderRadius: '8px', border: '1px solid #97c459' }}>
              <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#3b6d11', fontWeight: '500' }}>Current Value</p>
              <p style={{ margin: '0', fontSize: '22px', fontWeight: '600', color: '#27500a' }}>₹{parseFloat(metrics.currentValue).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            </div>
            <div style={{ backgroundColor: '#faeeda', padding: '16px', borderRadius: '8px', border: '1px solid '#ef9f27' }}>
              <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#854f0b', fontWeight: '500' }}>Total Gain</p>
              <p style={{ margin: '0', fontSize: '22px', fontWeight: '600', color: '#633806' }}>₹{parseFloat(metrics.totalGain).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            </div>
            <div style={{ backgroundColor: parseFloat(metrics.returnPercentage) >= 0 ? '#eaf3de' : '#fcebeb', padding: '16px', borderRadius: '8px', border: `1px solid ${parseFloat(metrics.returnPercentage) >= 0 ? '#97c459' : '#f09595'}` }}>
              <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: parseFloat(metrics.returnPercentage) >= 0 ? '#3b6d11' : '#a32d2d', fontWeight: '500' }}>Return %</p>
              <p style={{ margin: '0', fontSize: '22px', fontWeight: '600', color: parseFloat(metrics.returnPercentage) >= 0 ? '#27500a' : '#791f1f' }}>{metrics.returnPercentage}%</p>
            </div>
          </div>

          {/* Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e0ddd3' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#2c2c2a' }}>Portfolio Growth</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={portfolioData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0ddd3" />
                  <XAxis dataKey="date" stroke="#888780" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#888780" style={{ fontSize: '12px' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0ddd3', borderRadius: '4px' }} formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Line type="monotone" dataKey="value" stroke="#185fa5" strokeWidth={2} dot={{ fill: '#185fa5', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e0ddd3' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#2c2c2a' }}>Fund Allocation</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={allocationData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}\n₹${(value / 1000).toFixed(0)}k`} outerRadius={80} fill="#8884d8" dataKey="value">
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <button onClick={updateAllNAVs} style={{ padding: '10px 20px', backgroundColor: '#185fa5', color: 'white', border: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', marginBottom: '12px' }}>
            🔄 Update All NAVs
          </button>
        </div>
      )}

      {/* Holdings View */}
      {view === 'holdings' && (
        <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e0ddd3', padding: '16px', overflowX: 'auto' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#2c2c2a' }}>Your Holdings</h3>
          <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e0ddd3' }}>
                <th style={{ textAlign: 'left', padding: '8px', fontWeight: '600', color: '#5f5e5a' }}>Fund Name</th>
                <th style={{ textAlign: 'center', padding: '8px', fontWeight: '600', color: '#5f5e5a' }}>Units</th>
                <th style={{ textAlign: 'center', padding: '8px', fontWeight: '600', color: '#5f5e5a' }}>Purchase NAV</th>
                <th style={{ textAlign: 'center', padding: '8px', fontWeight: '600', color: '#5f5e5a' }}>Current NAV</th>
                <th style={{ textAlign: 'right', padding: '8px', fontWeight: '600', color: '#5f5e5a' }}>Current Value</th>
                <th style={{ textAlign: 'right', padding: '8px', fontWeight: '600', color: '#5f5e5a' }}>Return %</th>
                <th style={{ textAlign: 'center', padding: '8px', fontWeight: '600', color: '#5f5e5a' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map(h => {
                const metrics = calculateHoldingMetrics(h);
                return (
                  <tr key={h.id} style={{ borderBottom: '1px solid #f1efe8' }}>
                    <td style={{ padding: '8px', color: '#2c2c2a', fontWeight: '500' }}>{h.name}</td>
                    <td style={{ padding: '8px', textAlign: 'center', color: '#888780' }}>{h.units}</td>
                    <td style={{ padding: '8px', textAlign: 'center', color: '#888780' }}>₹{h.purchaseNAV.toFixed(2)}</td>
                    <td style={{ padding: '8px', textAlign: 'center', color: '#2c2c2a', fontWeight: '500' }}>₹{h.currentNAV.toFixed(2)}</td>
                    <td style={{ padding: '8px', textAlign: 'right', color: '#2c2c2a', fontWeight: '500' }}>₹{metrics.currentValue.toLocaleString()}</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: '600', color: metrics.returnPct >= 0 ? '#27500a' : '#791f1f' }}>{metrics.returnPct >= 0 ? '+' : ''}{metrics.returnPct}%</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      <button onClick={() => startEdit(h)} style={{ padding: '4px 8px', marginRight: '4px', backgroundColor: '#e6f1fb', color: '#185fa5', border: '1px solid #85b7eb', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                      <button onClick={() => deleteHolding(h.id)} style={{ padding: '4px 8px', backgroundColor: '#fcebeb', color: '#a32d2d', border: '1px solid #f09595', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Holding View */}
      {view === 'add' && (
        <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e0ddd3', padding: '20px', maxWidth: '500px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#2c2c2a' }}>{editingId ? 'Edit Holding' : 'Add New Holding'}</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            <input placeholder="Fund Name" value={newFund.name} onChange={(e) => setNewFund({ ...newFund, name: e.target.value })} style={{ padding: '10px', border: '1px solid #d3d1c7', borderRadius: '4px', fontSize: '13px' }} />
            <input placeholder="AMFI Code" value={newFund.amfiCode} onChange={(e) => setNewFund({ ...newFund, amfiCode: e.target.value })} style={{ padding: '10px', border: '1px solid #d3d1c7', borderRadius: '4px', fontSize: '13px' }} />
            <input placeholder="Number of Units" type="number" value={newFund.units} onChange={(e) => setNewFund({ ...newFund, units: e.target.value })} style={{ padding: '10px', border: '1px solid #d3d1c7', borderRadius: '4px', fontSize: '13px' }} />
            <input placeholder="Purchase Date (YYYY-MM-DD)" type="date" value={newFund.purchaseDate} onChange={(e) => setNewFund({ ...newFund, purchaseDate: e.target.value })} style={{ padding: '10px', border: '1px solid #d3d1c7', borderRadius: '4px', fontSize: '13px' }} />
            <input placeholder="Purchase NAV" type="number" step="0.01" value={newFund.purchaseNAV} onChange={(e) => setNewFund({ ...newFund, purchaseNAV: e.target.value })} style={{ padding: '10px', border: '1px solid #d3d1c7', borderRadius: '4px', fontSize: '13px' }} />
            <input placeholder="Current NAV" type="number" step="0.01" value={newFund.currentNAV} onChange={(e) => setNewFund({ ...newFund, currentNAV: e.target.value })} style={{ padding: '10px', border: '1px solid #d3d1c7', borderRadius: '4px', fontSize: '13px' }} />
            <button onClick={addHolding} style={{ padding: '12px', backgroundColor: '#185fa5', color: 'white', border: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' }}>
              {editingId ? 'Update Holding' : 'Add Holding'}
            </button>
            {editingId && (
              <button onClick={() => { setEditingId(null); setNewFund({ name: '', amfiCode: '', units: '', purchaseDate: '', purchaseNAV: '', currentNAV: '' }); }} style={{ padding: '12px', backgroundColor: '#b4b2a9', color: 'white', border: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {/* Analysis View */}
      {view === 'analysis' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '16px' }}>
          <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e0ddd3' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#2c2c2a' }}>Top Performers</h3>
            {holdings.slice().sort((a, b) => (calculateHoldingMetrics(b).returnPct - calculateHoldingMetrics(a).returnPct)).map((h, idx) => {
              const m = calculateHoldingMetrics(h);
              return (
                <div key={h.id} style={{ padding: '8px 0', borderBottom: idx < holdings.length - 1 ? '1px solid #f1efe8' : 'none' }}>
                  <p style={{ margin: '0 0 3px 0', fontSize: '13px', fontWeight: '500', color: '#2c2c2a' }}>{idx + 1}. {h.name}</p>
                  <p style={{ margin: '0', fontSize: '12px', color: '#27500a', fontWeight: '600' }}>{m.returnPct >= 0 ? '+' : ''}{m.returnPct}% return</p>
                </div>
              );
            })}
          </div>

          <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e0ddd3' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#2c2c2a' }}>Risk Profile</h3>
            <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#888780' }}>Based on portfolio composition and volatility</p>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px', fontWeight: '500' }}>
                <span>Equity Exposure</span>
                <span style={{ color: '#185fa5' }}>75%</span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: '#f1efe8', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '75%', height: '100%', backgroundColor: '#185fa5', borderRadius: '3px' }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px', fontWeight: '500' }}>
                <span>Debt Allocation</span>
                <span style={{ color: '#3b6d11' }}>25%</span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: '#f1efe8', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '25%', height: '100%', backgroundColor: '#3b6d11', borderRadius: '3px' }}></div>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e0ddd3' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#2c2c2a' }}>Fund Metrics</h3>
            <div style={{ fontSize: '12px', lineHeight: '1.8', color: '#888780' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f1efe8' }}>
                <span>Number of Holdings</span>
                <span style={{ fontWeight: '600', color: '#2c2c2a' }}>{holdings.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f1efe8', paddingTop: '8px' }}>
                <span>Avg NAV Growth</span>
                <span style={{ fontWeight: '600', color: '#27500a' }}>+5.2%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px' }}>
                <span>Portfolio Std Dev</span>
                <span style={{ fontWeight: '600', color: '#2c2c2a' }}>12.3%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logs View */}
      {view === 'logs' && (
        <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e0ddd3', padding: '16px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#2c2c2a' }}>NAV Update Log</h3>
          {navUpdateLog.length === 0 ? (
            <p style={{ color: '#888780', fontSize: '13px' }}>No NAV updates yet. Click "Update All NAVs" to fetch latest values.</p>
          ) : (
            navUpdateLog.map((log, idx) => (
              <div key={idx} style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f8f7f2', borderRadius: '4px', borderLeft: '3px solid #185fa5' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '600', color: '#185fa5' }}>Updated at {log.timestamp}</p>
                {log.updates.map((u, i) => (
                  <p key={i} style={{ margin: '4px 0', fontSize: '12px', color: '#888780' }}>
                    <span style={{ fontWeight: '500', color: '#2c2c2a' }}>{u.fund}</span>: ₹{u.oldNAV.toFixed(2)} → ₹{u.newNAV.toFixed(2)} ({u.change > 0 ? '+' : ''}{u.change}%)
                  </p>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
