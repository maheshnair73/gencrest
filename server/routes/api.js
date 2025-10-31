import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Mock data
const mockData = {
  visits: [
    { id: '1', dealerName: 'ABC Dealer', status: 'Completed', date: '2024-01-15' },
    { id: '2', dealerName: 'XYZ Store', status: 'Pending', date: '2024-01-16' }
  ],
  orders: [
    { id: '1', dealerName: 'ABC Dealer', amount: 50000, status: 'Approved' },
    { id: '2', dealerName: 'XYZ Store', amount: 25000, status: 'Pending' }
  ]
};

router.get('/visits', authenticateToken, (req, res) => {
  res.json(mockData.visits);
});

router.get('/orders', authenticateToken, (req, res) => {
  res.json(mockData.orders);
});

router.get('/dashboard', authenticateToken, (req, res) => {
  res.json({
    totalVisits: 25,
    completedVisits: 20,
    pendingVisits: 5,
    totalSales: 150000,
    monthlyTarget: 200000,
    achievement: 75
  });
});

export default router;