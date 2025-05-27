import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Provider as PaperProvider } from 'react-native-paper';

// Import screens
import DashboardScreen from './src/screens/DashboardScreen';
import NewReportScreen from './src/screens/NewReportScreen';
import ReportsListScreen from './src/screens/ReportsListScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ReportDetailsScreen from './src/screens/ReportDetailsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

function TabNavigator() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: IconName;

            switch (route.name) {
              case 'Dashboard':
                iconName = 'home';
                break;
              case 'New Report':
                iconName = 'plus-circle';
                break;
              case 'Reports':
                iconName = 'format-list-bulleted';
                break;
              case 'Profile':
                iconName = 'account';
                break;
              default:
                iconName = 'help-circle';
            }

            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#2196F3',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
          tabBarStyle: {
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
            elevation: 0,
            borderTopWidth: 1,
            borderTopColor: '#e0e0e0',
          },
          tabBarLabelStyle: {
            fontSize: 12,
            marginTop: -4,
          },
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="New Report" component={NewReportScreen} />
        <Tab.Screen name="Reports" component={ReportsListScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <PaperProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen 
              name="MainTabs" 
              component={TabNavigator} 
            />
            <Stack.Screen 
              name="Report Details" 
              component={ReportDetailsScreen}
            />
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    color: '#333',
  },
});
