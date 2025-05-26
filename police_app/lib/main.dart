import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:async';

import 'core/router/app_router.dart';

Future<void> main() async {
  // Set this to true to make zone errors fatal
  // BindingBase.debugZoneErrorsAreFatal = true;

  // Create a new zone for the entire app
  await runZonedGuarded(() async {
    // Ensure Flutter bindings are initialized in this zone
    WidgetsFlutterBinding.ensureInitialized();

    // Initialize Firebase with error handling
    try {
      await Firebase.initializeApp();
    } catch (e) {
      debugPrint('Failed to initialize Firebase: $e');
      // Continue without Firebase for now
    }

    // Initialize Hive if needed
    // await Hive.initFlutter();

    // Run the app in the same zone
    runApp(
      const ProviderScope(
        child: PoliceApp(),
      ),
    );
  }, (error, stack) {
    // Handle any errors that occur in the zone
    debugPrint('Error in app zone: $error');
    debugPrint('Stack trace: $stack');
  });
}

class PoliceApp extends ConsumerWidget {
  const PoliceApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'RAISE Police App',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF1E88E5),
          brightness: Brightness.light,
        ),
        textTheme: GoogleFonts.robotoTextTheme(
          Theme.of(context).textTheme,
        ),
        useMaterial3: true,
      ),
      darkTheme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF1E88E5),
          brightness: Brightness.dark,
        ),
        textTheme: GoogleFonts.robotoTextTheme(
          ThemeData.dark().textTheme,
        ),
        useMaterial3: true,
      ),
      routerConfig: router,
    );
  }
}
