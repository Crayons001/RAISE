import 'package:flutter/material.dart';

class AppConfig {
  static const String appName = 'RAISE Police App';
  static const String appVersion = '1.0.0';

  // API Configuration
  static const String apiBaseUrl =
      'https://api.raise.com'; // Replace with actual API URL

  // Firebase Configuration
  static const bool useFirebase = true;

  // Feature Flags
  static const bool enableLocationServices = true;
  static const bool enableCameraFeatures = true;
  static const bool enablePdfGeneration = true;

  // Theme Configuration
  static const Color primaryColor = Color(0xFF1E88E5);
  static const Color secondaryColor = Color(0xFF42A5F5);
  static const Color accentColor = Color(0xFF64B5F6);

  // Other Configuration
  static const int maxImageSize = 5 * 1024 * 1024; // 5MB
  static const List<String> supportedImageFormats = ['jpg', 'jpeg', 'png'];
  static const int maxPdfSize = 10 * 1024 * 1024; // 10MB
}
