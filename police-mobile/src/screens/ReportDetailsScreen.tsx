import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Image, SafeAreaView, ImageStyle, ViewStyle, Alert, ActivityIndicator } from 'react-native';
import { Text, Surface, Button, Chip, useTheme, IconButton, Divider, FAB, MD3Theme, Portal, Dialog } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, TabParamList } from '../navigation/AppNavigator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { Report as StoreReport, useReportStore } from '../stores/reportStore';

// Define the UI report type (extends store report with UI-specific fields)
type UIReport = StoreReport & {
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
};

type ReportDetailsRouteProp = RouteProp<RootStackParamList, 'Report Details'>;

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

const ReportDetailsScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ReportDetailsRouteProp>();
  const insets = useSafeAreaInsets();
  const { reportId } = route.params;
  const [isProcessing, setIsProcessing] = useState(false);
  const { getReport, updateReport } = useReportStore();
  const [report, setReport] = useState<UIReport | null>(null);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [showUnsubmitConfirmation, setShowUnsubmitConfirmation] = useState(false);

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
      marginLeft: 8,
      flex: 1,
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
    } as ImageStyle,
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
    content: {
      flex: 1,
      position: 'relative',
    },
    uploadContainer: {
      padding: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8f8f8',
      borderRadius: 8,
      borderWidth: 2,
      borderColor: '#e0e0e0',
      borderStyle: 'dashed',
    },
    uploadText: {
      marginTop: 12,
      marginBottom: 16,
      textAlign: 'center',
    },
    uploadButton: {
      marginTop: 8,
    },
    actionButtons: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 16,
      paddingTop: 16,
      backgroundColor: 'white',
      borderTopWidth: 1,
      borderTopColor: '#e0e0e0',
    },
    submitButton: {
      elevation: 2,
    },
    documentPreview: {
      marginTop: 16,
      borderRadius: 8,
      overflow: 'hidden' as const,
      backgroundColor: '#f5f5f5',
    } as ViewStyle,
    documentImage: {
      width: '100%',
      height: 400,
      backgroundColor: '#f5f5f5',
    } as ImageStyle,
    retakeButton: {
      marginTop: 16,
      alignSelf: 'center',
    },
    centered: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    submitWarning: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.errorContainer,
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
    },
    submitWarningText: {
      marginLeft: 8,
      flex: 1,
    },
  });

  useEffect(() => {
    // Load report data when component mounts
    const loadReport = async () => {
      const storeReport = getReport(reportId);
      if (storeReport) {
        // Convert store report to UI report
        const uiReport: UIReport = {
          ...storeReport,
          title: 'Vehicle Collision', // Mock data for now
          location: 'Main Street, Nairobi',
          date: '2024-03-27',
          time: '14:30',
          description: 'A two-vehicle collision occurred at the intersection of Main Street and Park Avenue.',
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
        setReport(uiReport);
      }
    };
    loadReport();
  }, [reportId, getReport]);

  const handleCaptureAbstract = async () => {
    if (!report) return;

    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required to capture the police abstract.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setIsProcessing(true);
        try {
          // Save the image directly without additional processing
          const savedUri = `${FileSystem.cacheDirectory}police_abstract_${reportId}.jpg`;
          await FileSystem.copyAsync({
            from: result.assets[0].uri,
            to: savedUri
          });

          // Update report in store
          await updateReport(reportId, {
            policeAbstractUri: savedUri,
            policeAbstractDate: new Date().toISOString(),
          });

          // Update local state
          setReport(prev => prev ? {
            ...prev,
            policeAbstractUri: savedUri,
            policeAbstractDate: new Date().toISOString(),
          } : null);

        } catch (error) {
          console.error('Error saving image:', error);
          Alert.alert('Error', 'Failed to save the image. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveAbstract = async () => {
    if (!report) return;
    await updateReport(reportId, { policeAbstractUri: undefined, policeAbstractDate: undefined });
    setReport(prev => prev ? { ...prev, policeAbstractUri: undefined, policeAbstractDate: undefined } : null);
  };

  const handleSubmitReport = async () => {
    if (!report) return;

    if (!report.policeAbstractUri) {
      Alert.alert(
        'Cannot Submit Report',
        'Please upload a police abstract before submitting the report.',
        [{ text: 'OK' }]
      );
      return;
    }

    setShowSubmitConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    if (!report) return;

    try {
      await updateReport(reportId, { status: 'complete' });
      setReport(prev => prev ? { ...prev, status: 'complete' } : null);
      setFlashMessage('Report has been submitted successfully.');
      setTimeout(() => {
        setFlashMessage(null);
        navigation.navigate('MainTabs');
      }, 2000);
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setShowSubmitConfirmation(false);
    }
  };

  const handleUnsubmitReport = async () => {
    if (!report) return;
    setShowUnsubmitConfirmation(true);
  };

  const handleConfirmUnsubmit = async () => {
    if (!report) return;

    try {
      await updateReport(reportId, { status: 'pending' });
      setReport(prev => prev ? { ...prev, status: 'pending' } : null);
      setFlashMessage('Report has been unsubmitted and is now editable.');
      setTimeout(() => {
        setFlashMessage(null);
      }, 2000);
    } catch (error) {
      console.error('Error unsubmitting report:', error);
      Alert.alert('Error', 'Failed to unsubmit report. Please try again.');
    } finally {
      setShowUnsubmitConfirmation(false);
    }
  };

  if (!report) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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

      <View style={styles.content}>
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 80 } // Always add padding for bottom button
          ]}
        >
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

          {/* Police Abstract Section - Modified for completed reports */}
          <Surface style={styles.section} elevation={1}>
            <Text variant="titleLarge" style={styles.sectionTitle}>Police Abstract</Text>
            <View style={styles.abstractDetails}>
              {report.policeAbstractUri ? (
                <>
                  {report.policeAbstractDate && (
                    <Text variant="bodyMedium">Submission Date: {report.policeAbstractDate}</Text>
                  )}
                  <View style={styles.documentPreview}>
                    <Image
                      source={{ uri: report.policeAbstractUri }}
                      style={styles.documentImage}
                      resizeMode="contain"
                    />
                    {report.status === 'pending' && (
                      <View style={{ position: 'absolute', top: 8, right: 8, flexDirection: 'row', alignItems: 'center' }}>
                        <IconButton
                          icon="close"
                          size={20}
                          onPress={handleRemoveAbstract}
                          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                          iconColor="white"
                          accessibilityLabel="Remove abstract"
                        />
                        <Button
                          mode="outlined"
                          onPress={handleCaptureAbstract}
                          style={styles.retakeButton}
                          icon="camera"
                        >
                          Retake Photo
                        </Button>
                      </View>
                    )}
                  </View>
                </>
              ) : (
                <View style={styles.uploadContainer}>
                  {isProcessing ? (
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                  ) : (
                    <>
                      <MaterialCommunityIcons 
                        name="file-document-outline" 
                        size={48} 
                        color={theme.colors.outline} 
                      />
                      <Text variant="bodyMedium" style={[styles.uploadText, { color: theme.colors.outline }]}>
                        {report.status === 'complete' 
                          ? 'Police abstract was submitted with this report'
                          : 'No police abstract uploaded yet'}
                      </Text>
                      {report.status === 'pending' && (
                        <Button
                          mode="contained"
                          onPress={handleCaptureAbstract}
                          style={styles.uploadButton}
                          icon="camera"
                        >
                          Capture Police Abstract
                        </Button>
                      )}
                    </>
                  )}
                </View>
              )}
            </View>
          </Surface>

          {/* Add a completion message for completed reports */}
          {report.status === 'complete' && (
            <Surface style={[styles.section, { backgroundColor: '#E8F5E9' }]} elevation={1}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MaterialCommunityIcons name="check-circle" size={24} color="#4CAF50" />
                <Text variant="bodyLarge" style={{ color: '#2E7D32' }}>
                  This report has been completed and submitted
                </Text>
              </View>
            </Surface>
          )}
        </ScrollView>

        {/* Action buttons for both pending and completed reports */}
        <Surface 
          style={[
            styles.actionButtons, 
            { paddingBottom: insets.bottom }
          ]} 
          elevation={4}
        >
          {report.status === 'pending' ? (
            <>
              {!report.policeAbstractUri && (
                <View style={styles.submitWarning}>
                  <MaterialCommunityIcons 
                    name="alert-circle-outline" 
                    size={24} 
                    color={theme.colors.error} 
                  />
                  <Text 
                    variant="bodyMedium" 
                    style={[styles.submitWarningText, { color: theme.colors.error }]}
                  >
                    Police abstract is required before submitting
                  </Text>
                </View>
              )}
              <Button
                mode="contained"
                onPress={handleSubmitReport}
                style={[
                  styles.submitButton, 
                  { 
                    backgroundColor: report.policeAbstractUri 
                      ? theme.colors.primary 
                      : theme.colors.surfaceDisabled,
                  }
                ]}
                disabled={!report.policeAbstractUri}
              >
                Submit Report
              </Button>
            </>
          ) : (
            <Button
              mode="outlined"
              onPress={handleUnsubmitReport}
              style={[styles.submitButton, { borderColor: theme.colors.primary }]}
              textColor={theme.colors.primary}
              icon="pencil"
            >
              Unsubmit and Edit
            </Button>
          )}
        </Surface>
      </View>

      {/* Confirmation Dialogs */}
      <Portal>
        <Dialog visible={showSubmitConfirmation} onDismiss={() => setShowSubmitConfirmation(false)}>
          <Dialog.Title>Confirm Submission</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to submit this report? Once submitted, the report will be marked as complete and will require unsubmitting to make any changes.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowSubmitConfirmation(false)}>Cancel</Button>
            <Button onPress={handleConfirmSubmit}>Submit</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={showUnsubmitConfirmation} onDismiss={() => setShowUnsubmitConfirmation(false)}>
          <Dialog.Title>Confirm Unsubmit</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to unsubmit this report? This will allow you to make changes to the report, but it will need to be resubmitted afterward.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowUnsubmitConfirmation(false)}>Cancel</Button>
            <Button onPress={handleConfirmUnsubmit}>Unsubmit</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {flashMessage && (
        <View style={{ position: 'absolute', top: insets.top + 10, left: 0, right: 0, zIndex: 100 }}>
          <Surface style={{ marginHorizontal: 32, padding: 12, backgroundColor: '#4CAF50', borderRadius: 8, alignItems: 'center' }} elevation={4}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>{flashMessage}</Text>
          </Surface>
        </View>
      )}
    </SafeAreaView>
  );
};

export default ReportDetailsScreen; 