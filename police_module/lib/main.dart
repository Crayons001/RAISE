import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:police_module/core/theme/app_theme.dart';
import 'package:police_module/features/home/presentation/screens/home_screen.dart';
import 'package:flutter/services.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'dart:async';

void main() async {
  // Ensure Flutter bindings are initialized
  WidgetsFlutterBinding.ensureInitialized();

  // Set up error handling first
  FlutterError.onError = (FlutterErrorDetails details) {
    FlutterError.presentError(details);
    debugPrint('Error caught by Flutter: ${details.exception}');
    debugPrint('Stack trace: ${details.stack}');
  };

  // Handle async errors
  runZonedGuarded(() async {
    // Initialize Firebase with better error handling
    try {
      // Try automatic initialization first
      await Firebase.initializeApp();
      debugPrint(
          'Firebase initialized successfully with automatic configuration');
    } catch (e, stackTrace) {
      debugPrint('Error with automatic Firebase initialization: $e');
      debugPrint('Stack trace: $stackTrace');

      // If automatic initialization fails, try with explicit options
      try {
        await Firebase.initializeApp(
          options: const FirebaseOptions(
            apiKey: "AIzaSyBQAM_eolGfx98ST056tbUFq-2CiwOpKFA",
            appId: "1:977314084204:android:affaced540f20638702f49",
            messagingSenderId: "977314084204",
            projectId: "raise-7655d",
            storageBucket: "raise-7655d.firebasestorage.app",
          ),
        );
        debugPrint('Firebase initialized successfully with explicit options');
      } catch (e2, stackTrace2) {
        debugPrint('Error with explicit Firebase initialization: $e2');
        debugPrint('Stack trace: $stackTrace2');
        // Show a user-friendly error message
        runApp(
          MaterialApp(
            home: Scaffold(
              body: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text(
                      'Failed to initialize app.',
                      style: TextStyle(color: Colors.red, fontSize: 18),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Error: ${e2.toString()}',
                      style: const TextStyle(color: Colors.red, fontSize: 14),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
        return; // Exit if Firebase initialization fails
      }
    }

    // Set preferred orientations
    await SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);

    // Run the app
    runApp(
      const ProviderScope(
        child: PoliceModuleApp(),
      ),
    );
  }, (error, stack) {
    debugPrint('Uncaught error: $error');
    debugPrint('Stack trace: $stack');
  });
}

class PoliceModuleApp extends StatelessWidget {
  const PoliceModuleApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Police Module',
      theme: AppTheme.lightTheme,
      home: const HomeScreen(),
      debugShowCheckedModeBanner: false,
    );
  }
}
