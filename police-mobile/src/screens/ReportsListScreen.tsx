import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Surface, useTheme, Chip, Searchbar } from 'react-native-paper';
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

type Report = {
  id: number;
  title: string;
  location: string;
  date: string;
  time: string;
  status: 'pending' | 'complete';
  vehicles: Array<{
    registrationNumber: string;
    make: string;
    model: string;
    damage: string;
  }>;
};

const ReportsListScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const reports = useReportStore(state => state.reports);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'complete'>('all');

  const sortedReports = reports.slice().sort((a, b) => Number(b.id) - Number(a.id));
  const filteredReports = sortedReports.filter((report) => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <View style={styles.container}>
      <Surface style={[styles.header, { backgroundColor: theme.colors.primary }]} elevation={2}>
        <Text variant="headlineMedium" style={styles.headerText}>Reports</Text>
      </Surface>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <Chip
            selected={statusFilter === 'all'}
            onPress={() => setStatusFilter('all')}
            style={styles.filterChip}
            mode="outlined"
          >
            All
          </Chip>
          <Chip
            selected={statusFilter === 'pending'}
            onPress={() => setStatusFilter('pending')}
            style={[styles.filterChip, { borderColor: '#FFA000' }]}
            mode="outlined"
            textStyle={statusFilter === 'pending' ? { color: '#FFA000' } : undefined}
          >
            Pending
          </Chip>
          <Chip
            selected={statusFilter === 'complete'}
            onPress={() => setStatusFilter('complete')}
            style={[styles.filterChip, { borderColor: '#4CAF50' }]}
            mode="outlined"
            textStyle={statusFilter === 'complete' ? { color: '#4CAF50' } : undefined}
          >
            Complete
          </Chip>
        </ScrollView>
      </View>

      <Searchbar
        placeholder="Search reports..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          {filteredReports.length > 0 ? (
            filteredReports.map((report) => (
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
                  {searchQuery || statusFilter !== 'all' 
                    ? 'No reports match your search criteria'
                    : 'No reports yet. Create your first report!'}
                </Text>
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>
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
    padding: 16,
  },
  headerText: {
    color: 'white',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
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
  filterContainer: {
    padding: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterChip: {
    marginRight: 8,
    borderWidth: 1,
  },
  searchBar: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    elevation: 0,
    backgroundColor: '#f5f5f5',
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

export default ReportsListScreen; 