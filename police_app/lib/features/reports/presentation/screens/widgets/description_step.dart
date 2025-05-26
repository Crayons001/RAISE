import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../providers/report_creation_provider.dart';

class DescriptionStep extends ConsumerStatefulWidget {
  final GlobalKey<FormState> formKey;

  const DescriptionStep({
    super.key,
    required this.formKey,
  });

  @override
  ConsumerState<DescriptionStep> createState() => _DescriptionStepState();
}

class _DescriptionStepState extends ConsumerState<DescriptionStep> {
  final _descriptionController = TextEditingController();
  final _weatherController = TextEditingController();
  final _roadConditionController = TextEditingController();
  final _visibilityController = TextEditingController();
  final _additionalNotesController = TextEditingController();

  @override
  void dispose() {
    _descriptionController.dispose();
    _weatherController.dispose();
    _roadConditionController.dispose();
    _visibilityController.dispose();
    _additionalNotesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: widget.formKey,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Accident Description',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _descriptionController,
              decoration: const InputDecoration(
                labelText: 'Accident Description',
                hintText: 'Provide a detailed description of the accident',
                border: OutlineInputBorder(),
              ),
              maxLines: 5,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please enter a description of the accident';
                }
                return null;
              },
              onChanged: (value) {
                ref
                    .read(reportCreationProvider.notifier)
                    .updateDescription(value);
              },
            ),
            const SizedBox(height: 24),
            Text(
              'Environmental Conditions',
              style: Theme.of(context).textTheme.titleSmall,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _weatherController,
              decoration: const InputDecoration(
                labelText: 'Weather Conditions',
                hintText: 'e.g., Clear, Rainy, Foggy',
                border: OutlineInputBorder(),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please enter the weather conditions';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _roadConditionController,
              decoration: const InputDecoration(
                labelText: 'Road Conditions',
                hintText: 'e.g., Dry, Wet, Icy',
                border: OutlineInputBorder(),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please enter the road conditions';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _visibilityController,
              decoration: const InputDecoration(
                labelText: 'Visibility',
                hintText: 'e.g., Good, Poor, Limited',
                border: OutlineInputBorder(),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please enter the visibility conditions';
                }
                return null;
              },
            ),
            const SizedBox(height: 24),
            Text(
              'Additional Notes',
              style: Theme.of(context).textTheme.titleSmall,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _additionalNotesController,
              decoration: const InputDecoration(
                labelText: 'Additional Notes',
                hintText: 'Any other relevant information',
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
            ),
          ],
        ),
      ),
    );
  }
}
