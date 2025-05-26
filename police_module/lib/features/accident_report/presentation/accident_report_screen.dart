import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/accident_report.dart';
import '../providers/accident_report_provider.dart';

class AccidentReportScreen extends ConsumerWidget {
  const AccidentReportScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final reportState = ref.watch(accidentReportProvider);
    final reportNotifier = ref.read(accidentReportProvider.notifier);

    return Scaffold(
      appBar: AppBar(title: const Text('Accident Report')),
      body: reportState.when(
        data: (report) {
          if (report == null) {
            return Center(
              child: ElevatedButton(
                onPressed: () => reportNotifier.startNewReport(),
                child: const Text('Start New Report'),
              ),
            );
          }
          return AccidentReportForm(report: report, notifier: reportNotifier);
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, st) => Center(child: Text('Error: $e')),
      ),
    );
  }
}

class AccidentReportForm extends StatefulWidget {
  final AccidentReport report;
  final AccidentReportNotifier notifier;
  const AccidentReportForm({
    required this.report,
    required this.notifier,
    Key? key,
  }) : super(key: key);

  @override
  State<AccidentReportForm> createState() => _AccidentReportFormState();
}

class _AccidentReportFormState extends State<AccidentReportForm> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _notesController;

  @override
  void initState() {
    super.initState();
    _notesController = TextEditingController(text: widget.report.notes ?? '');
  }

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Location
            Text('Location', style: Theme.of(context).textTheme.titleMedium),
            Text(
              'Lat: ${widget.report.location.latitude}, Lng: ${widget.report.location.longitude}',
            ),
            const SizedBox(height: 8),
            // TODO: Add button to update location

            // Vehicles
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Vehicles',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                IconButton(
                  icon: const Icon(Icons.add),
                  onPressed: () {
                    // TODO: Show dialog to add vehicle
                  },
                ),
              ],
            ),
            ...widget.report.vehicles.asMap().entries.map((entry) {
              final idx = entry.key;
              final vehicle = entry.value;
              return ListTile(
                title: Text(vehicle.registrationNumber),
                subtitle: Text(
                  '${vehicle.make} ${vehicle.model} (${vehicle.color})',
                ),
                trailing: IconButton(
                  icon: const Icon(Icons.delete),
                  onPressed:
                      () => setState(() => widget.notifier.removeVehicle(idx)),
                ),
              );
            }),
            const SizedBox(height: 8),
            // Media
            Text('Media', style: Theme.of(context).textTheme.titleMedium),
            Row(
              children: [
                ElevatedButton.icon(
                  icon: const Icon(Icons.camera_alt),
                  label: const Text('Add Photo'),
                  onPressed: () {
                    // TODO: Implement image picker
                  },
                ),
                const SizedBox(width: 8),
                ElevatedButton.icon(
                  icon: const Icon(Icons.videocam),
                  label: const Text('Add Video'),
                  onPressed: () {
                    // TODO: Implement video picker
                  },
                ),
              ],
            ),
            Wrap(
              spacing: 8,
              children:
                  widget.report.mediaFiles
                      .map(
                        (media) => Chip(
                          label: Text(
                            media.type == MediaType.image ? 'Photo' : 'Video',
                          ),
                          onDeleted:
                              () => setState(
                                () => widget.notifier.removeMediaFile(media.id),
                              ),
                        ),
                      )
                      .toList(),
            ),
            const SizedBox(height: 8),
            // Notes
            TextFormField(
              controller: _notesController,
              decoration: const InputDecoration(
                labelText: 'Notes (optional)',
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
              onChanged: widget.notifier.updateNotes,
            ),
            const SizedBox(height: 16),
            // Buttons
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                ElevatedButton(
                  onPressed: () async {
                    await widget.notifier.saveDraft();
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Draft saved')),
                      );
                    }
                  },
                  child: const Text('Save Draft'),
                ),
                ElevatedButton(
                  onPressed: () async {
                    if (_formKey.currentState?.validate() ?? false) {
                      await widget.notifier.submitReport();
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Report submitted')),
                        );
                      }
                    }
                  },
                  child: const Text('Submit'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
