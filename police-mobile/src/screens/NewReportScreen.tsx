import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Modal, TouchableOpacity, Platform, ActivityIndicator, TouchableWithoutFeedback } from 'react-native';
import { TextInput, Button, Text, Surface, List, IconButton, Portal, Dialog, useTheme, Searchbar } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_DEFAULT, MapPressEvent } from 'react-native-maps';
import * as MediaLibrary from 'expo-media-library';
import { useReportStore } from '../stores/reportStore';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

type MediaItem = {
  uri: string;
  type: 'photo' | 'video';
  fileName?: string | null;
  duration?: number | null;
  fileSize?: number | null;
};

type VehicleDetail = {
  id: string;
  make?: string;
  model?: string;
  color?: string;
  registrationNo: string;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const NewReportScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const addReport = useReportStore(state => state.addReport);
  const [formData, setFormData] = useState({
    accidentDate: new Date(),
    location: '',
    description: '',
    coordinates: null as { latitude: number; longitude: number } | null,
    address: '',
  });
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [vehicleDetails, setVehicleDetails] = useState<VehicleDetail[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showVehicleDialog, setShowVehicleDialog] = useState(false);
  const [newVehicle, setNewVehicle] = useState<VehicleDetail>({
    id: '',
    make: '',
    model: '',
    color: '',
    registrationNo: '',
  });
  const [mapError, setMapError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showMediaDialog, setShowMediaDialog] = useState(false);
  const [hasMediaPermission, setHasMediaPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      // Request location permissions
      const locationStatus = await Location.requestForegroundPermissionsAsync();
      
      // Request camera and media library permissions
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      const mediaStatus = await MediaLibrary.requestPermissionsAsync();
      setHasMediaPermission(mediaStatus.status === 'granted' && cameraStatus.status === 'granted');
      
      if (mediaStatus.status !== 'granted' || cameraStatus.status !== 'granted') {
        console.log('Media permissions denied');
      }
    })();
  }, []);

  const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      const [address] = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });
      
      if (address) {
        const addressParts = [
          address.street,
          address.city,
          address.region,
          address.postalCode,
          address.country
        ].filter(Boolean);
        
        return addressParts.join(', ');
      }
      return null;
    } catch (error) {
      console.error('Error getting address:', error);
      return null;
    }
  };

  const handleGetCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const address = await getAddressFromCoordinates(latitude, longitude);
      
      setFormData(prev => ({
        ...prev,
        coordinates: { latitude, longitude },
        location: address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        address: address || '',
      }));
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: 60,
        videoExportPreset: ImagePicker.VideoExportPreset.MediumQuality,
      });
      
      if (!result.canceled && result.assets) {
        const newMedia: MediaItem[] = result.assets.map(asset => ({
          uri: asset.uri,
          type: asset.type === 'video' ? 'video' : 'photo',
          fileName: asset.fileName || null,
          duration: asset.duration || null,
          fileSize: asset.fileSize || null,
        }));
        setMediaItems(prev => [...prev, ...newMedia]);
      }
    } catch (error) {
      console.error('Error taking photo/video:', error);
    }
  };

  const handleMediaPick = async () => {
    try {
      if (hasMediaPermission !== true) {
        const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
        const mediaStatus = await MediaLibrary.requestPermissionsAsync();
        if (cameraStatus.status !== 'granted' || mediaStatus.status !== 'granted') {
          console.log('Media permissions denied');
          return;
        }
        setHasMediaPermission(true);
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: 60,
        videoExportPreset: ImagePicker.VideoExportPreset.MediumQuality,
        selectionLimit: 0,
      });
      
      if (!result.canceled && result.assets) {
        const newMedia: MediaItem[] = result.assets.map(asset => ({
          uri: asset.uri,
          type: asset.type === 'video' ? 'video' : 'photo',
          fileName: asset.fileName || null,
          duration: asset.duration || null,
          fileSize: asset.fileSize || null,
        }));
        setMediaItems(prev => [...prev, ...newMedia]);
      }
    } catch (error) {
      console.error('Error picking media:', error);
    }
  };

  const searchLocation = async (query: string) => {
    try {
      console.log('Searching for:', query);
      // Use Expo's geocoding
      const results = await Location.geocodeAsync(query);
      
      console.log('Search results:', results);
      
      if (results && results.length > 0) {
        // Format the results with more detailed addresses
        const formattedResults = await Promise.all(
          results.map(async (result) => {
            const address = await getAddressFromCoordinates(result.latitude, result.longitude);
            return {
              ...result,
              formattedAddress: address || `${result.latitude.toFixed(6)}, ${result.longitude.toFixed(6)}`,
              mainText: address?.split(',')[0] || 'Unknown Location',
              secondaryText: address?.split(',').slice(1).join(',').trim() || '',
            };
          })
        );
        return formattedResults;
      }
      return [];
    } catch (error) {
      console.error('Error searching location:', error);
      return [];
    }
  };

  const handleSearchAddress = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    // Clear any existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set a new timeout to debounce the search
    const timeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchLocation(query);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching address:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500); // 500ms debounce

    setSearchTimeout(timeout);
  };

  const handleDismissSearch = () => {
    setShowSearchResults(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSelectSearchResult = async (result: any) => {
    console.log('Selected result:', result);
    handleDismissSearch();
    
    setFormData(prev => ({
      ...prev,
      coordinates: { 
        latitude: result.latitude, 
        longitude: result.longitude 
      },
      location: result.formattedAddress,
      address: result.formattedAddress,
    }));
  };

  const handleAddVehicle = () => {
    if (newVehicle.registrationNo) {
      setVehicleDetails(prev => [...prev, { ...newVehicle, id: Date.now().toString() }]);
      setNewVehicle({
        id: '',
        make: '',
        model: '',
        color: '',
        registrationNo: '',
      });
      setShowVehicleDialog(false);
    }
  };

  const handleRemoveVehicle = (id: string) => {
    setVehicleDetails(prev => prev.filter(vehicle => vehicle.id !== id));
  };

  const handleSubmit = () => {
    const newReport = {
      id: Date.now().toString(),
      reportNumber: 'RPT-' + Date.now(),
      title: 'Vehicle Collision', // TODO: Add title field to form
      location: formData.location,
      date: formData.accidentDate.toLocaleDateString(),
      time: formData.accidentDate.toLocaleTimeString(),
      status: 'pending' as const,
      description: formData.description,
      vehicles: vehicleDetails.map(vehicle => ({
        registrationNumber: vehicle.registrationNo,
        make: vehicle.make || 'Unknown',
        model: vehicle.model || 'Unknown',
        damage: 'To be assessed',
      })),
      evidence: mediaItems.map(item => ({
        type: item.type === 'photo' ? 'image' as const : 'document' as const,
        uri: item.uri,
        description: `${item.type === 'photo' ? 'Photo' : 'Video'} evidence`,
      })),
    };

    addReport(newReport);
    // Reset form fields
    setFormData({
      accidentDate: new Date(),
      location: '',
      description: '',
      coordinates: null,
      address: '',
    });
    setMediaItems([]);
    setVehicleDetails([]);
    navigation.goBack();
  };

  const handleMapPress = async (e: MapPressEvent) => {
    try {
      const { latitude, longitude } = e.nativeEvent.coordinate;
      const address = await getAddressFromCoordinates(latitude, longitude);
      
      setFormData(prev => ({
        ...prev,
        coordinates: { latitude, longitude },
        location: address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        address: address || '',
      }));
    } catch (error) {
      console.error('Error handling map press:', error);
      setMapError('Failed to update location. Please try again.');
    }
  };

  const handleMarkerDragEnd = async (e: any) => {
    try {
      const { latitude, longitude } = e.nativeEvent.coordinate;
      const address = await getAddressFromCoordinates(latitude, longitude);
      
      setFormData(prev => ({
        ...prev,
        coordinates: { latitude, longitude },
        location: address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        address: address || '',
      }));
    } catch (error) {
      console.error('Error handling marker drag:', error);
      setMapError('Failed to update location. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Surface style={[styles.header, { backgroundColor: theme.colors.primary }]} elevation={2}>
        <Text variant="headlineMedium" style={styles.headerText}>New Report</Text>
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

      <ScrollView style={styles.scrollView}>
        <Surface style={styles.section} elevation={1}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Accident Details</Text>
          
          <View style={styles.formGroup}>
            <TextInput
              label="Location"
              value={formData.location}
              onChangeText={(text) => {
                setFormData(prev => ({ ...prev, location: text }));
                handleSearchAddress(text);
              }}
              mode="outlined"
              left={<TextInput.Icon icon="map-marker" color={theme.colors.primary} />}
              right={
                <TextInput.Icon 
                  icon="crosshairs-gps" 
                  onPress={handleGetCurrentLocation}
                  color={theme.colors.primary}
                />
              }
              style={styles.input}
            />

            {showSearchResults && searchResults.length > 0 && (
              <Surface style={styles.searchResults} elevation={4}>
                {searchResults.map((result, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.searchResultItem}
                    onPress={() => handleSelectSearchResult(result)}
                  >
                    <MaterialCommunityIcons
                      name="map-marker"
                      size={20}
                      color={theme.colors.primary}
                    />
                    <View style={styles.searchResultText}>
                      <Text variant="bodyMedium" style={styles.searchResultMain}>
                        {result.mainText}
                      </Text>
                      <Text variant="bodySmall" style={styles.searchResultSecondary}>
                        {result.secondaryText}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </Surface>
            )}

            <TouchableOpacity
              style={styles.mapButton}
              onPress={() => setShowMap(true)}
            >
              <MaterialCommunityIcons
                name="map"
                size={24}
                color={theme.colors.primary}
              />
              <Text style={[styles.mapButtonText, { color: theme.colors.primary }]}>
                {formData.coordinates ? 'Update Location on Map' : 'Set Location on Map'}
              </Text>
            </TouchableOpacity>

            <TextInput
              label="Date & Time"
              value={`${formData.accidentDate.toLocaleDateString()} ${formData.accidentDate.toLocaleTimeString()}`}
              mode="outlined"
              left={<TextInput.Icon icon="calendar" color={theme.colors.primary} />}
              right={
                <TextInput.Icon 
                  icon="clock-outline" 
                  onPress={() => setShowDatePicker(true)}
                  color={theme.colors.primary}
                />
              }
              editable={false}
              style={styles.input}
            />

            <TextInput
              label="Description"
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.input}
            />
          </View>
        </Surface>

        <Surface style={styles.section} elevation={1}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Vehicles Involved</Text>
          
          {vehicleDetails.map((vehicle, index) => (
            <Surface key={vehicle.id} style={styles.vehicleCard} elevation={1}>
              <View style={styles.vehicleHeader}>
                <Text variant="titleMedium">Vehicle {index + 1}</Text>
                <IconButton
                  icon="close"
                  size={20}
                  onPress={() => handleRemoveVehicle(vehicle.id)}
                  iconColor={theme.colors.error}
                />
              </View>
              <View style={styles.vehicleDetails}>
                <TextInput
                  label="Registration Number"
                  value={vehicle.registrationNo}
                  mode="outlined"
                  style={styles.vehicleInput}
                  editable={false}
                />
                <TextInput
                  label="Make"
                  value={vehicle.make}
                  mode="outlined"
                  style={styles.vehicleInput}
                  editable={false}
                />
                <TextInput
                  label="Model"
                  value={vehicle.model}
                  mode="outlined"
                  style={styles.vehicleInput}
                  editable={false}
                />
                <TextInput
                  label="Color"
                  value={vehicle.color}
                  mode="outlined"
                  style={styles.vehicleInput}
                  editable={false}
                />
              </View>
            </Surface>
          ))}

          <Button
            mode="outlined"
            icon="plus"
            onPress={() => setShowVehicleDialog(true)}
            style={styles.addButton}
            textColor={theme.colors.primary}
          >
            Add Vehicle
          </Button>
        </Surface>

        <Surface style={styles.section} elevation={1}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Media</Text>
          
          <View style={styles.mediaGrid}>
            {mediaItems.map((item, index) => (
              <Surface key={index} style={styles.mediaItem} elevation={1}>
                {item.type === 'photo' ? (
                  <Image source={{ uri: item.uri }} style={styles.mediaImage} />
                ) : (
                  <View style={styles.videoThumbnail}>
                    <MaterialCommunityIcons name="video" size={32} color={theme.colors.primary} />
                    <Text variant="bodySmall">{item.duration}s</Text>
                  </View>
                )}
                <IconButton
                  icon="close"
                  size={20}
                  onPress={() => {
                    setMediaItems(prev => prev.filter((_, i) => i !== index));
                  }}
                  style={styles.removeMediaButton}
                  iconColor="white"
                />
              </Surface>
            ))}
            
            <TouchableOpacity
              style={styles.addMediaButton}
              onPress={() => setShowMediaDialog(true)}
            >
              <MaterialCommunityIcons
                name="plus"
                size={32}
                color={theme.colors.primary}
              />
              <Text style={[styles.addMediaText, { color: theme.colors.primary }]}>
                Add Media
              </Text>
            </TouchableOpacity>
          </View>
        </Surface>

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
          contentStyle={styles.submitButtonContent}
        >
          Submit Report
        </Button>
      </ScrollView>

      <Portal>
        <Dialog visible={showVehicleDialog} onDismiss={() => setShowVehicleDialog(false)}>
          <Dialog.Title>Add Vehicle</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Registration No."
              value={newVehicle.registrationNo}
              onChangeText={(text) => setNewVehicle(prev => ({ ...prev, registrationNo: text }))}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Make (Optional)"
              value={newVehicle.make}
              onChangeText={(text) => setNewVehicle(prev => ({ ...prev, make: text }))}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Model (Optional)"
              value={newVehicle.model}
              onChangeText={(text) => setNewVehicle(prev => ({ ...prev, model: text }))}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Color (Optional)"
              value={newVehicle.color}
              onChangeText={(text) => setNewVehicle(prev => ({ ...prev, color: text }))}
              mode="outlined"
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowVehicleDialog(false)}>Cancel</Button>
            <Button onPress={handleAddVehicle} disabled={!newVehicle.registrationNo}>Add</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={showMediaDialog} onDismiss={() => setShowMediaDialog(false)}>
          <Dialog.Title>Upload Evidence</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>
              Choose how you would like to upload evidence:
            </Text>
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button
              mode="contained"
              onPress={() => {
                setShowMediaDialog(false);
                handleTakePhoto();
              }}
              icon="camera"
              style={[styles.dialogButton, styles.cameraButton]}
            >
              Take Photo/Video
            </Button>
            <Button
              mode="contained"
              onPress={() => {
                setShowMediaDialog(false);
                handleMediaPick();
              }}
              icon="image-multiple"
              style={[styles.dialogButton, styles.galleryButton]}
            >
              Choose from Gallery
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Modal visible={showMap} onRequestClose={() => setShowMap(false)}>
          <View style={styles.mapContainer}>
            {mapError ? (
              <View style={styles.mapErrorContainer}>
                <Text style={styles.mapErrorText}>{mapError}</Text>
                <Button mode="contained" onPress={() => setMapError(null)}>
                  Try Again
                </Button>
              </View>
            ) : (
              <MapView
                provider={PROVIDER_DEFAULT}
                style={styles.map}
                initialRegion={{
                  latitude: formData.coordinates?.latitude || 0,
                  longitude: formData.coordinates?.longitude || 0,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
                onPress={handleMapPress}
              >
                {formData.coordinates && (
                  <Marker
                    coordinate={formData.coordinates}
                    draggable
                    onDragEnd={handleMarkerDragEnd}
                  />
                )}
              </MapView>
            )}
            <Button
              mode="contained"
              onPress={() => setShowMap(false)}
              style={styles.closeMapButton}
            >
              Done
            </Button>
          </View>
        </Modal>
      </Portal>
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
  section: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 8,
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    color: '#666',
  },
  formGroup: {
    gap: 16,
  },
  input: {
    backgroundColor: 'white',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  mapButtonText: {
    marginLeft: 8,
    fontSize: 16,
  },
  searchResults: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: 'white',
    borderRadius: 4,
    marginTop: 4,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchResultText: {
    marginLeft: 12,
    flex: 1,
  },
  searchResultMain: {
    fontWeight: 'bold',
  },
  searchResultSecondary: {
    color: '#666',
  },
  vehicleCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  vehicleDetails: {
    gap: 12,
  },
  vehicleInput: {
    backgroundColor: 'white',
  },
  addButton: {
    marginTop: 8,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mediaItem: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeMediaButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    margin: 0,
  },
  addMediaButton: {
    width: '30%',
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMediaText: {
    marginTop: 8,
    fontSize: 12,
  },
  submitButton: {
    margin: 16,
    marginTop: 8,
    marginBottom: 32,
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  closeMapButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  mapErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  mapErrorText: {
    marginBottom: 20,
    textAlign: 'center',
    color: '#d32f2f',
  },
  dialogActions: {
    flexDirection: 'column',
    padding: 16,
    gap: 8,
  },
  dialogButton: {
    width: '100%',
    marginVertical: 4,
  },
  cameraButton: {
    backgroundColor: '#4CAF50',
  },
  galleryButton: {
    backgroundColor: '#2196F3',
  },
  dialogText: {
    marginBottom: 16,
    fontSize: 16,
  },
});

export default NewReportScreen; 