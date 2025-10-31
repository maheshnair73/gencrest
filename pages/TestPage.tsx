import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div style={{
      padding: '40px',
      fontFamily: 'system-ui, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{
        fontSize: '48px',
        fontWeight: 'bold',
        color: '#2563eb',
        marginBottom: '20px'
      }}>
        ✅ Test Page - App is Working!
      </h1>
      <p style={{
        fontSize: '18px',
        color: '#4b5563',
        marginTop: '16px'
      }}>
        If you can see this, the Gencrest Activity Tracker app is loading correctly.
      </p>
      <div style={{
        marginTop: '32px',
        padding: '24px',
        backgroundColor: '#f3f4f6',
        borderRadius: '8px'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px' }}>Status:</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ padding: '8px 0' }}>✅ React is loaded</li>
          <li style={{ padding: '8px 0' }}>✅ TypeScript is working</li>
          <li style={{ padding: '8px 0' }}>✅ Vite build successful</li>
          <li style={{ padding: '8px 0' }}>✅ Preview server connected</li>
        </ul>
      </div>
    </div>
  );
};

export default TestPage;
