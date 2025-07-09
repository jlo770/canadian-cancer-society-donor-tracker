import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Box } from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  Source as SourceIcon, 
  Topic as TopicIcon, 
  Timeline as TimelineIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { useSentiment } from '../../context/SentimentContext';
import { triggerTwitterCollection, triggerRedditCollection, triggerNewsCollection } from '../../api/sentimentApi';

const drawerWidth = 240;

const Sidebar = () => {
  const location = useLocation();
  const { loading, setTimeRange } = useSentiment();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefreshData = async () => {
    if (loading || refreshing) return;
    
    setRefreshing(true);
    try {
      // Trigger data collection from all sources
      await Promise.all([
        triggerTwitterCollection(),
        triggerRedditCollection(),
        triggerNewsCollection()
      ]);
      
      // Refresh the data in the context
      setTimeRange(prev => prev); // This will trigger a re-fetch
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'By Source', icon: <SourceIcon />, path: '/by-source' },
    { text: 'By Topic', icon: <TopicIcon />, path: '/by-topic' },
    { text: 'Historical Trends', icon: <TimelineIcon />, path: '/trends' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#f8f8f8',
          borderRight: '1px solid rgba(0, 0, 0, 0.08)',
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img 
          src="/logo.png" 
          alt="Canadian Tire Logo" 
          style={{ maxWidth: '80%', height: 'auto' }} 
        />
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            component={Link} 
            to={item.path}
            selected={location.pathname === item.path}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'rgba(215, 25, 32, 0.08)',
                '&:hover': {
                  backgroundColor: 'rgba(215, 25, 32, 0.12)',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <ListItemIcon sx={{ color: location.pathname === item.path ? '#d71920' : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{
                fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                color: location.pathname === item.path ? '#d71920' : 'inherit',
              }}
            />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem 
          button 
          onClick={handleRefreshData}
          disabled={loading || refreshing}
        >
          <ListItemIcon>
            <RefreshIcon sx={{ color: refreshing ? '#d71920' : 'inherit' }} />
          </ListItemIcon>
          <ListItemText primary={refreshing ? 'Refreshing...' : 'Refresh Data'} />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;
