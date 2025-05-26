import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class AppRouter {
  static final GoRouter router = GoRouter(
    initialLocation: '/',
    routes: [
      // Auth Routes
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),

      // Main App Routes
      ShellRoute(
        builder: (context, state, child) => MainLayout(child: child),
        routes: [
          // Home/Dashboard
          GoRoute(path: '/', builder: (context, state) => const HomeScreen()),

          // New Report Routes
          GoRoute(
            path: '/new-report',
            builder: (context, state) => const NewReportScreen(),
            routes: [
              GoRoute(
                path: 'location',
                builder: (context, state) => const LocationPickerScreen(),
              ),
              GoRoute(
                path: 'vehicles',
                builder: (context, state) => const VehicleDetailsScreen(),
              ),
              GoRoute(
                path: 'media',
                builder: (context, state) => const MediaUploadScreen(),
              ),
              GoRoute(
                path: 'review',
                builder: (context, state) => const ReportReviewScreen(),
              ),
            ],
          ),

          // Abstracts Routes
          GoRoute(
            path: '/abstracts',
            builder: (context, state) => const AbstractsScreen(),
            routes: [
              GoRoute(
                path: 'upload/:reportId',
                builder:
                    (context, state) => AbstractUploadScreen(
                      reportId: state.pathParameters['reportId']!,
                    ),
              ),
              GoRoute(
                path: 'view/:abstractId',
                builder:
                    (context, state) => AbstractViewScreen(
                      abstractId: state.pathParameters['abstractId']!,
                    ),
              ),
            ],
          ),

          // Profile Routes
          GoRoute(
            path: '/profile',
            builder: (context, state) => const ProfileScreen(),
            routes: [
              GoRoute(
                path: 'edit',
                builder: (context, state) => const EditProfileScreen(),
              ),
              GoRoute(
                path: 'settings',
                builder: (context, state) => const SettingsScreen(),
              ),
            ],
          ),
        ],
      ),
    ],
    errorBuilder: (context, state) => const ErrorScreen(),
  );
}

// Placeholder screens - these will be implemented in their respective feature modules
class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});
  @override
  Widget build(BuildContext context) =>
      const Scaffold(body: Center(child: Text('Login Screen')));
}

class MainLayout extends StatelessWidget {
  final Widget child;
  const MainLayout({super.key, required this.child});
  @override
  Widget build(BuildContext context) => Scaffold(body: child);
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});
  @override
  Widget build(BuildContext context) =>
      const Scaffold(body: Center(child: Text('Home Screen')));
}

class NewReportScreen extends StatelessWidget {
  const NewReportScreen({super.key});
  @override
  Widget build(BuildContext context) =>
      const Scaffold(body: Center(child: Text('New Report Screen')));
}

class LocationPickerScreen extends StatelessWidget {
  const LocationPickerScreen({super.key});
  @override
  Widget build(BuildContext context) =>
      const Scaffold(body: Center(child: Text('Location Picker Screen')));
}

class VehicleDetailsScreen extends StatelessWidget {
  const VehicleDetailsScreen({super.key});
  @override
  Widget build(BuildContext context) =>
      const Scaffold(body: Center(child: Text('Vehicle Details Screen')));
}

class MediaUploadScreen extends StatelessWidget {
  const MediaUploadScreen({super.key});
  @override
  Widget build(BuildContext context) =>
      const Scaffold(body: Center(child: Text('Media Upload Screen')));
}

class ReportReviewScreen extends StatelessWidget {
  const ReportReviewScreen({super.key});
  @override
  Widget build(BuildContext context) =>
      const Scaffold(body: Center(child: Text('Report Review Screen')));
}

class AbstractsScreen extends StatelessWidget {
  const AbstractsScreen({super.key});
  @override
  Widget build(BuildContext context) =>
      const Scaffold(body: Center(child: Text('Abstracts Screen')));
}

class AbstractUploadScreen extends StatelessWidget {
  final String reportId;
  const AbstractUploadScreen({super.key, required this.reportId});
  @override
  Widget build(BuildContext context) => Scaffold(
    body: Center(child: Text('Abstract Upload Screen for $reportId')),
  );
}

class AbstractViewScreen extends StatelessWidget {
  final String abstractId;
  const AbstractViewScreen({super.key, required this.abstractId});
  @override
  Widget build(BuildContext context) => Scaffold(
    body: Center(child: Text('Abstract View Screen for $abstractId')),
  );
}

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});
  @override
  Widget build(BuildContext context) =>
      const Scaffold(body: Center(child: Text('Profile Screen')));
}

class EditProfileScreen extends StatelessWidget {
  const EditProfileScreen({super.key});
  @override
  Widget build(BuildContext context) =>
      const Scaffold(body: Center(child: Text('Edit Profile Screen')));
}

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});
  @override
  Widget build(BuildContext context) =>
      const Scaffold(body: Center(child: Text('Settings Screen')));
}

class ErrorScreen extends StatelessWidget {
  const ErrorScreen({super.key});
  @override
  Widget build(BuildContext context) =>
      const Scaffold(body: Center(child: Text('Error Screen')));
}
