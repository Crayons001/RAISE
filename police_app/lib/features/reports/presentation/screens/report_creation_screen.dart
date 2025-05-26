import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../providers/report_creation_provider.dart';
import 'widgets/location_step.dart';
import 'widgets/vehicle_step.dart';
import 'widgets/witness_step.dart';
import 'widgets/images_step.dart';
import 'widgets/description_step.dart';

class ReportCreationScreen extends ConsumerStatefulWidget {
  const ReportCreationScreen({super.key});

  @override
  ConsumerState<ReportCreationScreen> createState() =>
      _ReportCreationScreenState();
}

class _ReportCreationScreenState extends ConsumerState<ReportCreationScreen> {
  final _pageController = PageController();
  final _formKeys = List.generate(5, (_) => GlobalKey<FormState>());
  int _currentStep = 0;

  @override
  void initState() {
    super.initState();
    // Initialize a new report with a placeholder officer ID
    // TODO: Replace with actual officer ID from auth
    ref.read(reportCreationProvider.notifier).createNewReport('officer123');
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _nextStep() {
    if (_formKeys[_currentStep].currentState?.validate() ?? false) {
      if (_currentStep < 4) {
        _pageController.nextPage(
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeInOut,
        );
        setState(() {
          _currentStep++;
        });
      } else {
        _submitReport();
      }
    }
  }

  void _previousStep() {
    if (_currentStep > 0) {
      _pageController.previousPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
      setState(() {
        _currentStep--;
      });
    }
  }

  Future<void> _submitReport() async {
    try {
      await ref.read(reportCreationProvider.notifier).saveReport();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Report submitted successfully'),
            backgroundColor: Colors.green,
          ),
        );
        context.go('/reports');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error submitting report: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final stepTitles = [
      'Location',
      'Vehicles',
      'Witnesses',
      'Images',
      'Description',
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Accident Report'),
        actions: [
          IconButton(
            icon: const Icon(Icons.save),
            onPressed: _submitReport,
          ),
        ],
      ),
      body: Column(
        children: [
          LinearProgressIndicator(
            value: (_currentStep + 1) / stepTitles.length,
            backgroundColor: Colors.grey[200],
            valueColor: AlwaysStoppedAnimation<Color>(
              Theme.of(context).primaryColor,
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Text(
              stepTitles[_currentStep],
              style: Theme.of(context).textTheme.titleLarge,
            ),
          ),
          Expanded(
            child: PageView(
              controller: _pageController,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                LocationStep(formKey: _formKeys[0]),
                VehicleStep(formKey: _formKeys[1]),
                WitnessStep(formKey: _formKeys[2]),
                ImagesStep(formKey: _formKeys[3]),
                DescriptionStep(formKey: _formKeys[4]),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                if (_currentStep > 0)
                  ElevatedButton(
                    onPressed: _previousStep,
                    child: const Text('Previous'),
                  )
                else
                  const SizedBox.shrink(),
                ElevatedButton(
                  onPressed: _nextStep,
                  child: Text(_currentStep < 4 ? 'Next' : 'Submit'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
