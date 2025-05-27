import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, Surface, Button, Chip, useTheme, IconButton, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

// Define the report type
export type Report = {
  id: number;
  title: string;
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
  evidence: Array<{
    type: 'image' | 'document';
    uri: string;
    description: string;
  }>;
  policeAbstract?: {
    abstractNumber: string;
    officerName: string;
    submissionDate: string;
    details: string;
  };
};

type ReportDetailsRouteProp = RouteProp<RootStackParamList, 'Report Details'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ReportDetailsScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ReportDetailsRouteProp>();
  const { reportId } = route.params;

  // TODO: Replace with actual data fetching
  const report: Report = {
    id: reportId,
    title: 'Vehicle Collision',
    location: 'Main Street, Nairobi',
    date: '2024-03-27',
    time: '14:30',
    status: 'pending',
    description: 'A two-vehicle collision occurred at the intersection of Main Street and Park Avenue. Both vehicles sustained moderate damage. No injuries reported.',
    vehicles: [
      {
        registrationNumber: 'KAA 123A',
        make: 'Toyota',
        model: 'Corolla',
        damage: 'Front bumper damage, minor scratches',
      },
      {
        registrationNumber: 'KBB 456B',
        make: 'Honda',
        model: 'Civic',
        damage: 'Rear damage, broken taillight',
      },
    ],
    evidence: [
      {
        type: 'image',
        uri: 'https://example.com/accident1.jpg',
        description: 'Front view of collision',
      },
      {
        type: 'document',
        uri: 'https://example.com/statement.pdf',
        description: 'Witness statement',
      },
    ],
  };

  return (
    <View style={styles.container}>
      <Surface style={[styles.header, { backgroundColor: theme.colors.primary }]} elevation={2}>
        <IconButton
          icon="arrow-left"
          onPress={() => navigation.goBack()}
          iconColor="white"
        />
        <Text variant="headlineSmall" style={styles.headerText}>Report Details</Text>
        <View style={styles.headerRight}>
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
      </Surface>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.section} elevation={1}>
          <Text variant="titleLarge" style={styles.sectionTitle}>Incident Information</Text>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="map-marker" size={20} color={theme.colors.primary} />
            <Text variant="bodyLarge" style={styles.infoText}>{report.location}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="calendar" size={20} color={theme.colors.primary} />
            <Text variant="bodyLarge" style={styles.infoText}>{report.date}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="clock-outline" size={20} color={theme.colors.primary} />
            <Text variant="bodyLarge" style={styles.infoText}>{report.time}</Text>
          </View>
          <View style={styles.descriptionContainer}>
            <Text variant="titleMedium" style={styles.descriptionTitle}>Description</Text>
            <Text variant="bodyMedium" style={styles.descriptionText}>{report.description}</Text>
          </View>
        </Surface>

        <Surface style={styles.section} elevation={1}>
          <Text variant="titleLarge" style={styles.sectionTitle}>Vehicles Involved</Text>
          {report.vehicles.map((vehicle, index) => (
            <View key={index} style={styles.vehicleCard}>
              <Text variant="titleMedium">Vehicle {index + 1}</Text>
              <View style={styles.vehicleDetails}>
                <Text variant="bodyMedium">Registration: {vehicle.registrationNumber}</Text>
                <Text variant="bodyMedium">Make: {vehicle.make}</Text>
                <Text variant="bodyMedium">Model: {vehicle.model}</Text>
                <Text variant="bodyMedium">Damage: {vehicle.damage}</Text>
              </View>
            </View>
          ))}
        </Surface>

        <Surface style={styles.section} elevation={1}>
          <Text variant="titleLarge" style={styles.sectionTitle}>Evidence</Text>
          <View style={styles.evidenceGrid}>
            {report.evidence.map((item, index) => (
              <View key={index} style={styles.evidenceItem}>
                {item.type === 'image' ? (
                  <Image
                    source={{ uri: item.uri }}
                    style={styles.evidenceImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.documentIcon}>
                    <MaterialCommunityIcons name="file-pdf-box" size={40} color={theme.colors.primary} />
                  </View>
                )}
                <Text variant="bodySmall" style={styles.evidenceDescription}>
                  {item.description}
                </Text>
              </View>
            ))}
          </View>
        </Surface>

        {report.status === 'complete' && report.policeAbstract && (
          <Surface style={styles.section} elevation={1}>
            <Text variant="titleLarge" style={styles.sectionTitle}>Police Abstract</Text>
            <View style={styles.abstractDetails}>
              <Text variant="bodyMedium">Abstract Number: {report.policeAbstract.abstractNumber}</Text>
              <Text variant="bodyMedium">Officer: {report.policeAbstract.officerName}</Text>
              <Text variant="bodyMedium">Submission Date: {report.policeAbstract.submissionDate}</Text>
              <Divider style={styles.divider} />
              <Text variant="bodyMedium">{report.policeAbstract.details}</Text>
            </View>
          </Surface>
        )}

        {report.status === 'pending' && (
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              onPress={() => {/* TODO: Implement abstract submission */}}
              style={styles.submitButton}
            >
              Submit Police Abstract
            </Button>
          </View>
        )}
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
    flex: 1,
    marginLeft: 8,
  },
  headerRight: {
    marginLeft: 'auto',
  },
  statusChip: {
    height: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  section: {
    margin: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  sectionTitle: {
    marginBottom: 16,
    color: '#666',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 8,
    flex: 1,
  },
  descriptionContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  descriptionTitle: {
    marginBottom: 8,
    color: '#666',
  },
  descriptionText: {
    lineHeight: 20,
  },
  vehicleCard: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  vehicleDetails: {
    marginTop: 8,
  },
  evidenceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  evidenceItem: {
    width: '45%',
    marginBottom: 16,
  },
  evidenceImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  documentIcon: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  evidenceDescription: {
    marginTop: 8,
    textAlign: 'center',
  },
  abstractDetails: {
    gap: 8,
  },
  divider: {
    marginVertical: 12,
  },
  actionButtons: {
    padding: 16,
  },
  submitButton: {
    marginTop: 8,
  },
});

export default ReportDetailsScreen; 