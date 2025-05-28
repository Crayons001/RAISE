import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, ActivityIndicator, Dimensions, Image } from 'react-native';
import { MediaTypeOptions, launchCameraAsync, requestCameraPermissionsAsync } from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useTheme, Button } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useReportStore } from '../stores/reportStore';
import { PDFDocument } from 'pdf-lib';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type PoliceAbstractScreenRouteProp = RouteProp<RootStackParamList, 'Police Abstract'>;
type PoliceAbstractScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Police Abstract'>;

const { width: screenWidth } = Dimensions.get('window');
const DOCUMENT_FRAME_WIDTH = screenWidth * 0.8;
const DOCUMENT_FRAME_HEIGHT = DOCUMENT_FRAME_WIDTH * 1.4; // A4 aspect ratio

const PoliceAbstractScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<PoliceAbstractScreenNavigationProp>();
  const route = useRoute<PoliceAbstractScreenRouteProp>();
  const { reportId, reportNumber } = route.params;
  const { updateReport } = useReportStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const pickImage = async () => {
    try {
      const { status } = await requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required to take photos.');
        return;
      }

      const result = await launchCameraAsync({
        mediaTypes: MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1.4], // A4 aspect ratio
        quality: 1,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        
        // Process the image to ensure it's properly oriented and sized
        const manipResult = await ImageManipulator.manipulateAsync(
          imageUri,
          [{ resize: { width: 2480 } }], // Standard A4 width at 300 DPI
          { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
        );

        setSelectedImage(manipResult.uri);
        await processAndSaveImage(manipResult.uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    }
  };

  const processAndSaveImage = async (imageUri: string) => {
    try {
      setIsProcessing(true);

      // Process the image to ensure it's properly oriented and sized
      const manipResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 2480 } }], // Standard A4 width at 300 DPI
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Save the processed image
      const savedUri = `${FileSystem.cacheDirectory}police_abstract_${reportId}.jpg`;
      await FileSystem.copyAsync({
        from: manipResult.uri,
        to: savedUri
      });

      // Update report with image URI
      await updateReport(reportId, {
        policeAbstractUri: savedUri,
        policeAbstractDate: new Date().toISOString(),
      });

      Alert.alert(
        'Success',
        'Police abstract document has been saved successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error processing image:', error);
      Alert.alert('Error', 'Failed to process and save the document. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.documentFrame, { borderColor: theme.colors.outline }]}>
          {selectedImage ? (
            <Image 
              source={{ uri: selectedImage }} 
              style={styles.previewImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.placeholder}>
              <MaterialCommunityIcons 
                name="file-document-outline" 
                size={64} 
                color={theme.colors.outline} 
              />
              <Text style={[styles.placeholderText, { color: theme.colors.outline }]}>
                No document selected
              </Text>
            </View>
          )}
        </View>

        <Text style={[styles.hint, { color: theme.colors.onSurface }]}>
          Position the document within the frame
        </Text>

        <Button
          mode="contained"
          onPress={pickImage}
          disabled={isProcessing}
          loading={isProcessing}
          style={styles.captureButton}
          icon="camera"
        >
          {isProcessing ? 'Processing...' : 'Take Photo'}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentFrame: {
    width: DOCUMENT_FRAME_WIDTH,
    height: DOCUMENT_FRAME_HEIGHT,
    borderWidth: 2,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    marginBottom: 20,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  hint: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
  },
  captureButton: {
    width: '100%',
    padding: 8,
  },
});

export default PoliceAbstractScreen; 