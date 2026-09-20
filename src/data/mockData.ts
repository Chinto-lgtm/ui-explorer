export const mockDashboardKpis = [
  { id: 'kpi-1', title: 'Total Revenue', value: '$128,450', change: '+14.2%', isPositive: true, sparkline: [40, 55, 60, 75, 70, 85, 95] },
  { id: 'kpi-2', title: 'Active Users', value: '24,890', change: '+8.4%', isPositive: true, sparkline: [12, 18, 15, 22, 28, 32, 45] },
  { id: 'kpi-3', title: 'Conversion Rate', value: '3.42%', change: '-0.8%', isPositive: false, sparkline: [4.5, 4.2, 4.0, 3.8, 3.6, 3.5, 3.42] },
  { id: 'kpi-4', title: 'Avg Order Value', value: '$84.20', change: '+5.1%', isPositive: true, sparkline: [70, 72, 75, 78, 80, 82, 84.2] }
];

export const mockRevenueData = [
  { label: 'Jan', value: 4500 },
  { label: 'Feb', value: 5200 },
  { label: 'Mar', value: 4800 },
  { label: 'Apr', value: 6100 },
  { label: 'May', value: 7500 },
  { label: 'Jun', value: 8900 },
  { label: 'Jul', value: 9400 }
];

export const mockActivityData = [
  { label: 'Mon', value: 120 },
  { label: 'Tue', value: 240 },
  { label: 'Wed', value: 180 },
  { label: 'Thu', value: 320 },
  { label: 'Fri', value: 410 },
  { label: 'Sat', value: 290 },
  { label: 'Sun', value: 150 }
];

export const mockRecentActivities = [
  { id: '1', user: 'Alex Morgan', action: 'Created new style definition', target: 'Neon Cyberpunk', time: '10m ago' },
  { id: '2', user: 'Elena Rostova', action: 'Exported CSS variables', target: 'Glassmorphism Theme', time: '25m ago' },
  { id: '3', user: 'David Chen', action: 'Updated component behavior', target: 'Button Pressed state', time: '1h ago' },
  { id: '4', user: 'Sarah Jenkins', action: 'Ran style diff test', target: 'Neumorphism vs Bento Grid', time: '2h ago' }
];

export const mockTableUsers = [
  { id: 'usr-101', name: 'Sophia Martinez', email: 'sophia@example.com', role: 'Lead Designer', status: 'Active', spent: '$1,200' },
  { id: 'usr-102', name: 'Marcus Vance', email: 'marcus@example.com', role: 'Frontend Engineer', status: 'Active', spent: '$850' },
  { id: 'usr-103', name: 'Amara Okafor', email: 'amara@example.com', role: 'Product Manager', status: 'Inactive', spent: '$420' },
  { id: 'usr-104', name: 'Lucas Meyer', email: 'lucas@example.com', role: 'Design Systems Arch', status: 'Active', spent: '$2,400' },
  { id: 'usr-105', name: 'Chloe Dubois', email: 'chloe@example.com', role: 'UI Developer', status: 'Pending', spent: '$150' }
];
