import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';

import '../../domain/models/accident_report.dart';

final reportCreationProvider =
    StateNotifierProvider<ReportCreationNotifier, AsyncValue<AccidentReport?>>(
  (ref) => ReportCreationNotifier(),
);

class ReportCreationNotifier
    extends StateNotifier<AsyncValue<AccidentReport?>> {
  ReportCreationNotifier() : super(const AsyncValue.data(null));

  Future<void> createNewReport(String officerId) async {
    state = const AsyncValue.loading();
    try {
      final report = AccidentReport(
        officerId: officerId,
        location: '',
        coordinates: const GeoPoint(0, 0),
        vehicles: [],
        description: '',
      );
      state = AsyncValue.data(report);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }

  Future<void> updateLocation(String location, GeoPoint coordinates) async {
    state.whenData((report) {
      if (report != null) {
        state = AsyncValue.data(
          report.copyWith(
            location: location,
            coordinates: coordinates,
          ),
        );
      }
    });
  }

  Future<void> addVehicle(Vehicle vehicle) async {
    state.whenData((report) {
      if (report != null) {
        final updatedVehicles = List<Vehicle>.from(report.vehicles)
          ..add(vehicle);
        state = AsyncValue.data(
          report.copyWith(vehicles: updatedVehicles),
        );
      }
    });
  }

  Future<void> addWitness(Person witness) async {
    state.whenData((report) {
      if (report != null) {
        final updatedWitnesses = List<Person>.from(report.witnesses)
          ..add(witness);
        state = AsyncValue.data(
          report.copyWith(witnesses: updatedWitnesses),
        );
      }
    });
  }

  Future<void> updateDescription(String description) async {
    state.whenData((report) {
      if (report != null) {
        state = AsyncValue.data(
          report.copyWith(description: description),
        );
      }
    });
  }

  Future<void> addImage(File imageFile) async {
    state.whenData((report) async {
      if (report != null) {
        try {
          // Upload image to Firebase Storage
          final storageRef = FirebaseStorage.instance.ref().child(
              'reports/${report.id}/images/${DateTime.now().millisecondsSinceEpoch}.jpg');

          await storageRef.putFile(imageFile);
          final imageUrl = await storageRef.getDownloadURL();

          // Update report with new image URL
          final updatedImageUrls = List<String>.from(report.imageUrls)
            ..add(imageUrl);
          state = AsyncValue.data(
            report.copyWith(imageUrls: updatedImageUrls),
          );
        } catch (e, stack) {
          state = AsyncValue.error(e, stack);
        }
      }
    });
  }

  Future<void> saveReport() async {
    state.whenData((report) async {
      if (report != null) {
        try {
          // Save to Firestore
          await FirebaseFirestore.instance
              .collection('reports')
              .doc(report.id)
              .set(report.toJson());

          // Update status to 'submitted'
          state = AsyncValue.data(
            report.copyWith(status: 'submitted'),
          );
        } catch (e, stack) {
          state = AsyncValue.error(e, stack);
        }
      }
    });
  }

  Future<void> pickAndAddImage(ImageSource source) async {
    try {
      final picker = ImagePicker();
      final pickedFile = await picker.pickImage(
        source: source,
        maxWidth: 1920,
        maxHeight: 1080,
        imageQuality: 85,
      );

      if (pickedFile != null) {
        await addImage(File(pickedFile.path));
      }
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }
}
