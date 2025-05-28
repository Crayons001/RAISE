import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, NativeScrollEvent, NativeSyntheticEvent, Animated } from 'react-native';
import { Text, Card, Button, Surface, useTheme, IconButton, FAB, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useReportStore } from '../stores/reportStore';

type TabParamList = {
  Dashboard: undefined;
  'New Report': undefined;
  Reports: undefined;
  Profile: undefined;
};

type RootStackParamList = {
  MainTabs: undefined;
  'Report Details': { reportId: string };
};

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

type Report = {
  id: string;
  reportNumber: string;
  location: string;
  date: string;
  time: string;
  status: 'pending' | 'complete';
  description: string;
  vehicles: Array<{
    registrationNumber: string;
    make: string;
    model: string;
    damage: string;
  }>;
};

const DashboardScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const reports = useReportStore(state => state.reports);
  const [fabOpacity] = useState(new Animated.Value(1));
  const [isAtBottom, setIsAtBottom] = useState(false);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= 
      contentSize.height - paddingToBottom;
    
    setIsAtBottom(isCloseToBottom);
    
    // Animate FAB opacity
    Animated.timing(fabOpacity, {
      toValue: isCloseToBottom ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const sortedReports = reports.slice().sort((a, b) => parseInt(b.id) - parseInt(a.id));
  const recentReports = sortedReports.slice(0, 5);

  return (
    <View style={styles.container}>
      <Surface style={[styles.header, { backgroundColor: theme.colors.primary }]} elevation={2}>
        <Text variant="headlineMedium" style={styles.headerText}>Dashboard</Text>
        <View style={styles.headerRight}>
          <Text variant="titleLarge" style={styles.appTitle}>RAISE</Text>
          <IconButton
            icon="bell"
            size={24}
            onPress={() => {}}
            style={styles.notificationButton}
            iconColor="white"
          />
        </View>
      </Surface>

      <ScrollView 
        style={styles.scrollView}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.statsContainer}>
          <Card style={styles.statsCard}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.statsNumber}>
                {reports.filter(r => r.status === 'pending').length}
              </Text>
              <Text variant="bodyMedium" style={styles.statsLabel}>Pending Reports</Text>
            </Card.Content>
          </Card>
          <Card style={styles.statsCard}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.statsNumber}>
                {reports.filter(r => r.status === 'complete').length}
              </Text>
              <Text variant="bodyMedium" style={styles.statsLabel}>Completed Reports</Text>
            </Card.Content>
          </Card>
        </View>

        <Surface style={styles.section} elevation={1}>
          <View style={styles.sectionHeader}>
            <Text variant="titleLarge" style={styles.sectionTitle}>Recent Reports</Text>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Reports')}
              style={styles.viewAllButton}
            >
              View All
            </Button>
          </View>
          {recentReports.map((report) => (
            <Card
              key={report.id}
              style={styles.reportCard}
              onPress={() => navigation.navigate('Report Details', { reportId: report.id })}
            >
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Text variant="titleMedium" style={styles.reportNumber}>
                    {report.reportNumber}
                  </Text>
                  <Chip
                    mode="flat"
                    style={[
                      styles.statusChip,
                      { backgroundColor: report.status === 'complete' ? '#4CAF50' : '#FFA000' }
                    ]}
                    textStyle={{ color: 'white' }}
                  >
                    {report.status === 'complete' ? 'Complete' : 'Pending'}
                  </Chip>
                </View>
                <View style={styles.cardDetails}>
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="map-marker" size={20} color={theme.colors.primary} />
                    <Text variant="bodyMedium" style={styles.infoText}>{report.location}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="calendar" size={20} color={theme.colors.primary} />
                    <Text variant="bodyMedium" style={styles.infoText}>{report.date}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="clock-outline" size={20} color={theme.colors.primary} />
                    <Text variant="bodyMedium" style={styles.infoText}>{report.time}</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}
        </Surface>
      </ScrollView>

      <Animated.View style={[styles.fabContainer, { opacity: fabOpacity }]}>
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('New Report')}
          label="New Report"
          color="white"
        />
      </Animated.View>

      {isAtBottom && (
        <Surface style={styles.bottomButtonContainer} elevation={4}>
          <Button
            mode="contained"
            icon="plus"
            onPress={() => navigation.navigate('New Report')}
            style={[styles.bottomButton, { backgroundColor: theme.colors.primary }]}
            labelStyle={styles.bottomButtonLabel}
          >
            New Report
          </Button>
        </Surface>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontWeight: 'bold',
  },
  appTitle: {
    color: 'white',
    fontWeight: 'bold',
    marginRight: 8,
  },
  notificationButton: {
    margin: 0,
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    gap: 8,
  },
  statsCard: {
    flex: 1,
    elevation: 2,
  },
  statsNumber: {
    marginTop: 8,
    fontWeight: 'bold',
  },
  statsLabel: {
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  viewAllButton: {
    margin: 0,
  },
  reportCard: {
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  reportNumber: {
    fontWeight: 'bold',
    color: '#333',
  },
  statusChip: {
    height: 32,
    justifyContent: 'center',
    paddingHorizontal: 12,
    minWidth: 90,
  },
  cardDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
    flexWrap: 'wrap',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    marginRight: 8,
  },
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  fab: {
    elevation: 4,
  },
  bottomButtonContainer: {
    padding: 16,
    backgroundColor: 'white',
  },
  bottomButton: {
    elevation: 4,
  },
  bottomButtonLabel: {
    color: 'white',
    fontSize: 16,
  },
});

export default DashboardScreen; 