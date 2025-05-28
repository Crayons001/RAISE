import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

import DashboardScreen from '../screens/DashboardScreen';
import ReportsListScreen from '../screens/ReportsListScreen';
import NewReportScreen from '../screens/NewReportScreen';
import ReportDetailsScreen from '../screens/ReportDetailsScreen';
import PoliceAbstractScreen from '../screens/PoliceAbstractScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Define all possible screen parameters
export type RootStackParamList = {
  MainTabs: undefined;
  'Report Details': { 
    reportId: string;  // Changed to string to match the store type
    reportNumber?: string;
  };
  'Police Abstract': { 
    reportId: string;  // Changed to string to match the store type
    reportNumber?: string;
  };
};

export type TabParamList = {
  Dashboard: undefined;
  'New Report': undefined;
  Reports: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const MainTabsNavigator = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.outline,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialCommunityIcons.glyphMap;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'view-dashboard';
              break;
            case 'New Report':
              iconName = 'plus-circle';
              break;
            case 'Reports':
              iconName = 'file-document';
              break;
            case 'Profile':
              iconName = 'account';
              break;
            default:
              iconName = 'help-circle';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
        }}
      />
      <Tab.Screen 
        name="New Report" 
        component={NewReportScreen}
        options={{
          tabBarLabel: 'New Report',
        }}
      />
      <Tab.Screen 
        name="Reports" 
        component={ReportsListScreen}
        options={{
          tabBarLabel: 'Reports',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const theme = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: theme.colors.onPrimary,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      >
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabsNavigator}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="Report Details" 
          component={ReportDetailsScreen}
          options={({ route }) => ({
            title: `Report #${route.params.reportNumber || route.params.reportId}`,
            headerBackTitle: 'Back',
          })}
        />
        <Stack.Screen 
          name="Police Abstract" 
          component={PoliceAbstractScreen}
          options={({ route }) => ({
            title: `Police Abstract - Report #${route.params.reportNumber || route.params.reportId}`,
            headerBackTitle: 'Back',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 