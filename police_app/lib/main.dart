import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:async';
import 'dart:io';
import 'package:flutter/foundation.dart';

import 'firebase_options.dart';
import 'core/router/app_router.dart';
import 'core/config/app_config.dart';

// Top-level error handler for zone
void Function(Object, StackTrace) _handleZoneError =
    (Object error, StackTrace stack) {
  debugPrint('Uncaught error in zone: $error');
  debugPrint('Stack trace: $stack');
};

// Create a provider for Firebase initialization status
final firebaseInitializedProvider = StateProvider<bool>((ref) => false);

// Custom error widget
class CustomErrorWidget extends StatelessWidget {
  final FlutterErrorDetails errorDetails;

  const CustomErrorWidget({
    super.key,
    required this.errorDetails,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: Colors.red),
              const SizedBox(height: 16),
              Text(
                'An error occurred',
                style: GoogleFonts.roboto(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                errorDetails.exception.toString(),
                textAlign: TextAlign.center,
                style: GoogleFonts.roboto(fontSize: 16),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

Future<void> main() async {
  // Set up global error handling
  FlutterError.onError = (FlutterErrorDetails details) {
    FlutterError.presentError(details);
    debugPrint('Flutter Error: ${details.exception}');
    debugPrint('Stack trace: ${details.stack}');
  };

  // Ensure Flutter is initialized
  try {
    WidgetsFlutterBinding.ensureInitialized();
    debugPrint('Flutter binding initialized successfully');
  } catch (e, stack) {
    debugPrint('Failed to initialize Flutter binding: $e');
    debugPrint('Stack trace: $stack');
    return;
  }

  // Initialize Firebase with more detailed error handling
  bool firebaseInitialized = false;
  try {
    debugPrint('Starting Firebase initialization...');

    // Add platform-specific initialization
    if (Platform.isAndroid) {
      debugPrint('Initializing Firebase for Android...');
    } else if (Platform.isIOS) {
      debugPrint('Initializing Firebase for iOS...');
    }

    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    ).timeout(
      const Duration(seconds: 15),
      onTimeout: () {
        throw TimeoutException(
            'Firebase initialization timed out after 15 seconds');
      },
    );

    // Verify Firebase is actually initialized
    if (Firebase.apps.isNotEmpty) {
      debugPrint(
          'Firebase initialized successfully with ${Firebase.apps.length} apps');
      firebaseInitialized = true;
    } else {
      throw Exception('Firebase apps list is empty after initialization');
    }
  } catch (e, stack) {
    debugPrint('Failed to initialize Firebase: $e');
    debugPrint('Stack trace: $stack');
    firebaseInitialized = false;
  }

  // Run the app in a zone for better error handling
  await runZonedGuarded(
    () async {
      runApp(
        ProviderScope(
          child: PoliceApp(isFirebaseInitialized: firebaseInitialized),
        ),
      );
    },
    (error, stack) {
      debugPrint('Error in app zone: $error');
      debugPrint('Stack trace: $stack');
    },
  );
}

class PoliceApp extends ConsumerWidget {
  final bool isFirebaseInitialized;

  const PoliceApp({
    super.key,
    required this.isFirebaseInitialized,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    try {
      final router = ref.watch(routerProvider);

      if (!isFirebaseInitialized) {
        return MaterialApp(
          home: Scaffold(
            body: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.error_outline,
                        size: 48, color: Colors.red),
                    const SizedBox(height: 16),
                    Text(
                      'Failed to initialize Firebase',
                      style: GoogleFonts.roboto(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Please check your internet connection and try again',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.roboto(fontSize: 16),
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: () {
                        // Restart the app
                        main();
                      },
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      }

      return MaterialApp.router(
        title: AppConfig.appName,
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(
            seedColor: AppConfig.primaryColor,
            brightness: Brightness.light,
          ),
          textTheme: GoogleFonts.robotoTextTheme(Theme.of(context).textTheme),
          useMaterial3: true,
        ),
        darkTheme: ThemeData(
          colorScheme: ColorScheme.fromSeed(
            seedColor: AppConfig.primaryColor,
            brightness: Brightness.dark,
          ),
          textTheme: GoogleFonts.robotoTextTheme(ThemeData.dark().textTheme),
          useMaterial3: true,
        ),
        routerConfig: router,
        builder: (context, child) {
          if (child == null) return const SizedBox.shrink();

          return ErrorBoundary(
            child: child,
          );
        },
      );
    } catch (e, stack) {
      debugPrint('Error building app: $e');
      debugPrint('Stack trace: $stack');
      return MaterialApp(
        home: Scaffold(
          body: Center(
            child: Text('Error building app: $e'),
          ),
        ),
      );
    }
  }
}

class ErrorBoundary extends StatefulWidget {
  final Widget child;

  const ErrorBoundary({
    super.key,
    required this.child,
  });

  @override
  State<ErrorBoundary> createState() => _ErrorBoundaryState();
}

class _ErrorBoundaryState extends State<ErrorBoundary> {
  FlutterErrorDetails? _error;

  @override
  void initState() {
    super.initState();
    _setupErrorHandling();
  }

  void _setupErrorHandling() {
    // Use a static method to handle errors
    FlutterError.onError = (FlutterErrorDetails details) {
      setState(() {
        _error = details;
      });
      debugPrint('Error in widget tree: ${details.exception}');
      debugPrint('Stack trace: ${details.stack}');
    };
  }

  @override
  Widget build(BuildContext context) {
    if (_error != null) {
      return CustomErrorWidget(errorDetails: _error!);
    }
    return widget.child;
  }
}
