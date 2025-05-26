import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../domain/models/accident_report.dart';
import '../../../providers/report_creation_provider.dart';

class WitnessStep extends ConsumerStatefulWidget {
  final GlobalKey<FormState> formKey;

  const WitnessStep({
    super.key,
    required this.formKey,
  });

  @override
  ConsumerState<WitnessStep> createState() => _WitnessStepState();
}

class _WitnessStepState extends ConsumerState<WitnessStep> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _addressController = TextEditingController();
  final _statementController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _addressController.dispose();
    _statementController.dispose();
    super.dispose();
  }

  void _addWitness() {
    if (_formKey.currentState?.validate() ?? false) {
      final witness = Person(
        name: _nameController.text,
        phoneNumber: _phoneController.text,
        email: _emailController.text,
        address: _addressController.text,
      );

      ref.read(reportCreationProvider.notifier).addWitness(witness);

      // Clear form
      _nameController.clear();
      _phoneController.clear();
      _emailController.clear();
      _addressController.clear();
      _statementController.clear();

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Witness added successfully')),
      );
    }
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
              'Witness Information',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 16),
            Form(
              key: _formKey,
              child: Column(
                children: [
                  TextFormField(
                    controller: _nameController,
                    decoration: const InputDecoration(
                      labelText: 'Full Name',
                      border: OutlineInputBorder(),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter the witness name';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _phoneController,
                          decoration: const InputDecoration(
                            labelText: 'Phone Number',
                            border: OutlineInputBorder(),
                          ),
                          keyboardType: TextInputType.phone,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: TextFormField(
                          controller: _emailController,
                          decoration: const InputDecoration(
                            labelText: 'Email',
                            border: OutlineInputBorder(),
                          ),
                          keyboardType: TextInputType.emailAddress,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _addressController,
                    decoration: const InputDecoration(
                      labelText: 'Address',
                      border: OutlineInputBorder(),
                    ),
                    maxLines: 2,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _statementController,
                    decoration: const InputDecoration(
                      labelText: 'Witness Statement',
                      border: OutlineInputBorder(),
                      hintText:
                          'Enter the witness statement about the accident',
                    ),
                    maxLines: 5,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _addWitness,
              child: const Text('Add Witness'),
            ),
          ],
        ),
      ),
    );
  }
}
