import 'dart:io';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:image_picker/image_picker.dart';
import 'package:uuid/uuid.dart';

import '../domain/models/accident_report.dart';

final reportCreationProvider =
    StateNotifierProvider<ReportCreationNotifier, AsyncValue<AccidentReport?>>(
  (ref) => ReportCreationNotifier(),
);

class ReportCreationNotifier
    extends StateNotifier<AsyncValue<AccidentReport?>> {
  ReportCreationNotifier() : super(const AsyncValue.data(null));

  final _firestore = FirebaseFirestore.instance;
  final _storage = FirebaseStorage.instance;
  final _uuid = const Uuid();

  Future<void> createNewReport(String officerId) async {
    state = const AsyncValue.loading();
    try {
      final report = AccidentReport(
        id: _uuid.v4(),
        officerId: officerId,
        timestamp: DateTime.now(),
        location: '',
        coordinates: const GeoPoint(0, 0),
        imageUrls: [],
        vehicles: [],
        witnesses: [],
        description: '',
        status: 'draft',
        additionalDetails: {},
      );
      state = AsyncValue.data(report);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }

  Future<void> updateLocation(String location, GeoPoint coordinates) async {
    state.whenData((report) {
      if (report != null) {
        state = AsyncValue.data(report.copyWith(
          location: location,
          coordinates: coordinates,
        ));
      }
    });
  }

  Future<void> addVehicle(Vehicle vehicle) async {
    state.whenData((report) {
      if (report != null) {
        final updatedVehicles = List<Vehicle>.from(report.vehicles)
          ..add(vehicle);
        state = AsyncValue.data(report.copyWith(vehicles: updatedVehicles));
      }
    });
  }

  Future<void> addWitness(Person witness) async {
    state.whenData((report) {
      if (report != null) {
        final updatedWitnesses = List<Person>.from(report.witnesses)
          ..add(witness);
        state = AsyncValue.data(report.copyWith(witnesses: updatedWitnesses));
      }
    });
  }

  Future<void> updateDescription(String description) async {
    state.whenData((report) {
      if (report != null) {
        state = AsyncValue.data(report.copyWith(description: description));
      }
    });
  }

  Future<void> addImage(File imageFile) async {
    state.whenData((report) async {
      if (report != null) {
        try {
          final imageId = _uuid.v4();
          final imagePath = 'reports/${report.id}/images/$imageId.jpg';
          final imageRef = _storage.ref().child(imagePath);

          await imageRef.putFile(imageFile);
          final imageUrl = await imageRef.getDownloadURL();

          final updatedImageUrls = List<String>.from(report.imageUrls)
            ..add(imageUrl);
          state = AsyncValue.data(report.copyWith(imageUrls: updatedImageUrls));
        } catch (e) {
          state = AsyncValue.error(e, StackTrace.current);
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
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  Future<void> saveReport() async {
    state.whenData((report) async {
      if (report != null) {
        try {
          final updatedReport = report.copyWith(
            status: 'submitted',
            timestamp: DateTime.now(),
          );

          await _firestore
              .collection('reports')
              .doc(updatedReport.id)
              .set(updatedReport.toJson());

          state = AsyncValue.data(updatedReport);
        } catch (e) {
          state = AsyncValue.error(e, StackTrace.current);
          rethrow;
        }
      }
    });
  }
}
