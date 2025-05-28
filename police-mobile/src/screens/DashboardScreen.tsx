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
  'Report Details': { reportId: number };
};

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

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

  const stats = [
    {
      title: 'Total Reports',
      value: reports.length.toString(),
      icon: 'file-document' as const,
    },
    {
      title: 'Pending',
      value: reports.filter(r => r.status === 'pending').length.toString(),
      icon: 'clock-outline' as const,
    },
    {
      title: 'Completed',
      value: reports.filter(r => r.status === 'complete').length.toString(),
      icon: 'check-circle' as const,
    },
  ];

  const recentReports = reports.slice().sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 5);

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
          {stats.map((stat, index) => (
            <Card key={index} style={styles.statCard}>
              <Card.Content style={styles.statContent}>
                <MaterialCommunityIcons
                  name={stat.icon}
                  size={32}
                  color={theme.colors.primary}
                />
                <Text variant="headlineMedium" style={styles.statValue}>
                  {stat.value}
                </Text>
                <Text variant="bodyMedium" style={styles.statTitle}>
                  {stat.title}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </View>

        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Recent Reports
          </Text>
          {recentReports.length > 0 ? (
            recentReports.map((report) => (
              <Card 
                key={report.id}
                style={styles.reportCard}
                onPress={() => navigation.navigate('Report Details', { reportId: report.id })}
              >
                <Card.Content>
                  <View style={styles.reportHeader}>
                    <Text variant="titleMedium" style={styles.reportTitle}>{report.title}</Text>
                    <Chip
                      mode="flat"
                      style={[
                        styles.statusChip,
                        { 
                          backgroundColor: report.status === 'complete' ? '#4CAF50' : '#FFA000',
                          minWidth: 90,
                        }
                      ]}
                      textStyle={styles.statusChipText}
                    >
                      {report.status === 'complete' ? 'Complete' : 'Pending'}
                    </Chip>
                  </View>
                  <View style={styles.reportDetails}>
                    <MaterialCommunityIcons
                      name="map-marker"
                      size={16}
                      color={theme.colors.primary}
                    />
                    <Text variant="bodyMedium" style={styles.reportLocation}>
                      {report.location}
                    </Text>
                    <MaterialCommunityIcons
                      name="calendar"
                      size={16}
                      color={theme.colors.primary}
                    />
                    <Text variant="bodyMedium">{report.date}</Text>
                    <MaterialCommunityIcons
                      name="clock-outline"
                      size={16}
                      color={theme.colors.primary}
                    />
                    <Text variant="bodyMedium">{report.time}</Text>
                  </View>
                  <View style={styles.vehicleInfo}>
                    <Text variant="bodySmall" style={styles.vehicleCount}>
                      {report.vehicles.length} vehicle{report.vehicles.length > 1 ? 's' : ''} involved
                    </Text>
                  </View>
                </Card.Content>
                <Card.Actions>
                  <Button 
                    mode="text" 
                    onPress={() => navigation.navigate('Report Details', { reportId: report.id })}
                  >
                    View Details
                  </Button>
                </Card.Actions>
              </Card>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text variant="bodyLarge" style={styles.emptyText}>
                  No reports yet. Create your first report!
                </Text>
              </Card.Content>
            </Card>
          )}
        </View>
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
  statCard: {
    flex: 1,
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
    padding: 8,
  },
  statValue: {
    marginTop: 8,
    fontWeight: 'bold',
  },
  statTitle: {
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  reportCard: {
    marginBottom: 12,
    elevation: 2,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  reportTitle: {
    flex: 1,
  },
  statusChip: {
    height: 32,
    justifyContent: 'center',
    paddingHorizontal: 12,
    minWidth: 90,
  },
  statusChipText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  reportDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
    flexWrap: 'wrap',
  },
  reportLocation: {
    marginRight: 16,
  },
  vehicleInfo: {
    marginTop: 8,
  },
  vehicleCount: {
    color: '#666',
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
  emptyCard: {
    marginTop: 8,
    backgroundColor: '#f8f8f8',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    padding: 16,
  },
});

export default DashboardScreen; 