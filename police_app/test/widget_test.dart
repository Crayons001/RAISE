// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:police_app/main.dart';

void main() {
  testWidgets('App should render with correct theme',
      (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(
      const ProviderScope(
        child: PoliceApp(),
      ),
    );

    // Verify that the app is rendered with MaterialApp
    expect(find.byType(MaterialApp), findsOneWidget);

    // Verify that the app title is correct
    expect(find.text('RAISE Police App'), findsOneWidget);
  });

  testWidgets('Splash screen should be shown initially',
      (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(
      const ProviderScope(
        child: PoliceApp(),
      ),
    );

    // Verify that the splash screen is shown
    expect(find.byType(SplashScreen), findsOneWidget);
    expect(find.byType(FlutterLogo), findsOneWidget);
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
  });
}
