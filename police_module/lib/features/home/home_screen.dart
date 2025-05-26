import 'package:flutter/material.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('RAISE Police Module')),
      body: Center(
        child: ElevatedButton(
          onPressed: () {
            // TODO: Replace with your router (e.g. GoRouter) or Navigator.pushNamed.
            Navigator.of(context).pushNamed('/accident_report');
          },
          child: const Text('New Accident Report'),
        ),
      ),
    );
  }
}
