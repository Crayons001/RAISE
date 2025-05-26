import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:police_module/features/accident_report/models/accident_report.dart';

final accidentReportProvider =
    StateNotifierProvider<AccidentReportNotifier, AsyncValue<AccidentReport?>>(
      (ref) => AccidentReportNotifier(),
    );

class AccidentReportNotifier
    extends StateNotifier<AsyncValue<AccidentReport?>> {
  AccidentReportNotifier() : super(const AsyncValue.data(null));

  void startNewReport() {
    state = const AsyncValue.loading();
    try {
      // Initialize with empty data
      final report = AccidentReport(
        location: Location(latitude: 0, longitude: 0),
        vehicles: [],
        mediaFiles: [],
        officerId: 'current_user_id', // TODO: Get from auth provider
      );
      state = AsyncValue.data(report);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }

  void updateLocation(Location location) {
    state.whenData((report) {
      if (report != null) {
        state = AsyncValue.data(report.copyWith(location: location));
      }
    });
  }

  void addVehicle(Vehicle vehicle) {
    state.whenData((report) {
      if (report != null) {
        final updatedVehicles = List<Vehicle>.from(report.vehicles)
          ..add(vehicle);
        state = AsyncValue.data(report.copyWith(vehicles: updatedVehicles));
      }
    });
  }

  void updateVehicle(int index, Vehicle vehicle) {
    state.whenData((report) {
      if (report != null) {
        final updatedVehicles = List<Vehicle>.from(report.vehicles);
        updatedVehicles[index] = vehicle;
        state = AsyncValue.data(report.copyWith(vehicles: updatedVehicles));
      }
    });
  }

  void removeVehicle(int index) {
    state.whenData((report) {
      if (report != null) {
        final updatedVehicles = List<Vehicle>.from(report.vehicles)
          ..removeAt(index);
        state = AsyncValue.data(report.copyWith(vehicles: updatedVehicles));
      }
    });
  }

  void addMediaFile(MediaFile mediaFile) {
    state.whenData((report) {
      if (report != null) {
        final updatedMediaFiles = List<MediaFile>.from(report.mediaFiles)
          ..add(mediaFile);
        state = AsyncValue.data(report.copyWith(mediaFiles: updatedMediaFiles));
      }
    });
  }

  void removeMediaFile(String mediaId) {
    state.whenData((report) {
      if (report != null) {
        final updatedMediaFiles =
            report.mediaFiles.where((media) => media.id != mediaId).toList();
        state = AsyncValue.data(report.copyWith(mediaFiles: updatedMediaFiles));
      }
    });
  }

  void updateNotes(String notes) {
    state.whenData((report) {
      if (report != null) {
        state = AsyncValue.data(report.copyWith(notes: notes));
      }
    });
  }

  Future<void> submitReport() async {
    state = const AsyncValue.loading();
    try {
      // TODO: Implement API call to submit report
      await Future.delayed(const Duration(seconds: 2)); // Simulated API call
      state.whenData((report) {
        if (report != null) {
          state = AsyncValue.data(
            report.copyWith(status: 'submitted', syncedAt: DateTime.now()),
          );
        }
      });
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }

  Future<void> saveDraft() async {
    state.whenData((report) async {
      if (report != null) {
        state = const AsyncValue.loading();
        try {
          // TODO: Implement local storage for draft
          await Future.delayed(const Duration(seconds: 1)); // Simulated storage
          state = AsyncValue.data(report.copyWith(status: 'draft'));
        } catch (error, stackTrace) {
          state = AsyncValue.error(error, stackTrace);
        }
      }
    });
  }

  void clearReport() {
    state = const AsyncValue.data(null);
  }
}
