import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase'; 
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './App.css';

function App() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // logs 40ක් ගමු (Services දෙකක් තියෙන නිසා)
    const q = query(collection(db, 'serverLogs'), orderBy('timestamp', 'desc'), limit(40));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const docData = doc.data();
        return {
          id: doc.id,
          ...docData,
          time: docData.timestamp ? new Date(docData.timestamp.toDate()).toLocaleTimeString() : ''
        };
      }).reverse(); 
      
      setLogs(data);
    });

    return () => unsubscribe();
  }, []);

  // Services දෙකටම අදාළ logs වෙන් කරගැනීම
  const googleLogs = logs.filter(log => log.serviceName === 'Google');
  const jsonLogs = logs.filter(log => log.serviceName === 'JSONPlaceholder API');

  // අලුත්ම තත්ත්වය (Status) බලාගන්න අන්තිම log එක ගැනීම
  const latestGoogleLog = googleLogs[googleLogs.length - 1];
  const latestJsonLog = jsonLogs[jsonLogs.length - 1];

  // Status Card එකක් හදන පොඩි Component එකක්
  const StatusCard = ({ title, log }) => {
    const isUp = log?.status === 'UP';
    return (
      <div style={{
        flex: 1, padding: '20px', borderRadius: '10px', color: '#fff',
        backgroundColor: isUp ? '#28a745' : '#dc3545', // කොළ හෝ රතු
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>{title}</h3>
        <h2 style={{ margin: 0 }}>{isUp ? '✅ UP' : '❌ DOWN'}</h2>
        <p style={{ margin: '10px 0 0 0' }}>Ping: {log?.responseTime || 0}ms</p>
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>🚀 Real-Time Service Monitor Dashboard</h2>
      
      {/* Status Cards ටික පෙන්නන තැන */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <StatusCard title="Google Server" log={latestGoogleLog} />
        <StatusCard title="JSONPlaceholder API" log={latestJsonLog} />
      </div>

      {/* Charts ටික පෙන්නන තැන */}
      <div style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
        
        {/* Google Chart */}
        <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '10px' }}>
          <h3>Google Server Response Time (Ping)</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={googleLogs}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="responseTime" stroke="#007bff" strokeWidth={3} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* JSONPlaceholder Chart */}
        <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '10px' }}>
          <h3>JSON API Response Time (Ping)</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={jsonLogs}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="responseTime" stroke="#ff7300" strokeWidth={3} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;