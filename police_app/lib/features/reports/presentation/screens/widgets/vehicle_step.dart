import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../domain/models/accident_report.dart';
import '../../../providers/report_creation_provider.dart';

class VehicleStep extends ConsumerStatefulWidget {
  final GlobalKey<FormState> formKey;

  const VehicleStep({
    super.key,
    required this.formKey,
  });

  @override
  ConsumerState<VehicleStep> createState() => _VehicleStepState();
}

class _VehicleStepState extends ConsumerState<VehicleStep> {
  final _formKey = GlobalKey<FormState>();
  final _registrationController = TextEditingController();
  final _makeController = TextEditingController();
  final _modelController = TextEditingController();
  final _colorController = TextEditingController();
  final _damageController = TextEditingController();
  final _driverNameController = TextEditingController();
  final _driverLicenseController = TextEditingController();
  final _driverPhoneController = TextEditingController();
  final List<Person> _passengers = [];

  @override
  void dispose() {
    _registrationController.dispose();
    _makeController.dispose();
    _modelController.dispose();
    _colorController.dispose();
    _damageController.dispose();
    _driverNameController.dispose();
    _driverLicenseController.dispose();
    _driverPhoneController.dispose();
    super.dispose();
  }

  void _addVehicle() {
    if (_formKey.currentState?.validate() ?? false) {
      final vehicle = Vehicle(
        registrationNumber: _registrationController.text,
        make: _makeController.text,
        model: _modelController.text,
        color: _colorController.text,
        driver: _driverNameController.text.isNotEmpty
            ? Person(
                name: _driverNameController.text,
                licenseNumber: _driverLicenseController.text,
                phoneNumber: _driverPhoneController.text,
              )
            : null,
        passengers: _passengers,
        damageDescription: _damageController.text,
      );

      ref.read(reportCreationProvider.notifier).addVehicle(vehicle);

      // Clear form
      _registrationController.clear();
      _makeController.clear();
      _modelController.clear();
      _colorController.clear();
      _damageController.clear();
      _driverNameController.clear();
      _driverLicenseController.clear();
      _driverPhoneController.clear();
      setState(() => _passengers.clear());

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vehicle added successfully')),
      );
    }
  }

  void _addPassenger() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Passenger'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              decoration: const InputDecoration(labelText: 'Name'),
              onSubmitted: (name) {
                if (name.isNotEmpty) {
                  setState(() {
                    _passengers.add(Person(name: name));
                  });
                  Navigator.pop(context);
                }
              },
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
        ],
      ),
    );
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
              'Vehicle Information',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 16),
            Form(
              key: _formKey,
              child: Column(
                children: [
                  TextFormField(
                    controller: _registrationController,
                    decoration: const InputDecoration(
                      labelText: 'Registration Number',
                      border: OutlineInputBorder(),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter the registration number';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _makeController,
                          decoration: const InputDecoration(
                            labelText: 'Make',
                            border: OutlineInputBorder(),
                          ),
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Please enter the make';
                            }
                            return null;
                          },
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: TextFormField(
                          controller: _modelController,
                          decoration: const InputDecoration(
                            labelText: 'Model',
                            border: OutlineInputBorder(),
                          ),
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Please enter the model';
                            }
                            return null;
                          },
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _colorController,
                    decoration: const InputDecoration(
                      labelText: 'Color',
                      border: OutlineInputBorder(),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter the color';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _damageController,
                    decoration: const InputDecoration(
                      labelText: 'Damage Description',
                      border: OutlineInputBorder(),
                    ),
                    maxLines: 3,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter the damage description';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'Driver Information',
                    style: Theme.of(context).textTheme.titleSmall,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _driverNameController,
                    decoration: const InputDecoration(
                      labelText: 'Driver Name',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _driverLicenseController,
                          decoration: const InputDecoration(
                            labelText: 'License Number',
                            border: OutlineInputBorder(),
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: TextFormField(
                          controller: _driverPhoneController,
                          decoration: const InputDecoration(
                            labelText: 'Phone Number',
                            border: OutlineInputBorder(),
                          ),
                          keyboardType: TextInputType.phone,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Passengers',
                        style: Theme.of(context).textTheme.titleSmall,
                      ),
                      TextButton.icon(
                        onPressed: _addPassenger,
                        icon: const Icon(Icons.add),
                        label: const Text('Add Passenger'),
                      ),
                    ],
                  ),
                  if (_passengers.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Card(
                      child: ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: _passengers.length,
                        itemBuilder: (context, index) {
                          final passenger = _passengers[index];
                          return ListTile(
                            title: Text(passenger.name),
                            trailing: IconButton(
                              icon: const Icon(Icons.delete),
                              onPressed: () {
                                setState(() {
                                  _passengers.removeAt(index);
                                });
                              },
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _addVehicle,
              child: const Text('Add Vehicle'),
            ),
          ],
        ),
      ),
    );
  }
}
