import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/DashboardScreen';
import NewReportScreen from '../screens/NewReportScreen';
import ReportDetailsScreen from '../screens/ReportDetailsScreen';

export type RootStackParamList = {
  Dashboard: undefined;
  'New Report': undefined;
  'Report Details': { reportId: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Dashboard"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="New Report" component={NewReportScreen} />
        <Stack.Screen name="Report Details" component={ReportDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 