import 'package:uuid/uuid.dart';

class AccidentReport {
  final String id;
  final DateTime timestamp;
  final Location location;
  final List<Vehicle> vehicles;
  final List<MediaFile> mediaFiles;
  final String? notes;
  final String status; // 'draft', 'submitted', 'synced'
  final String officerId;
  final DateTime? syncedAt;

  AccidentReport({
    String? id,
    DateTime? timestamp,
    required this.location,
    required this.vehicles,
    required this.mediaFiles,
    this.notes,
    this.status = 'draft',
    required this.officerId,
    this.syncedAt,
  }) : id = id ?? const Uuid().v4(),
       timestamp = timestamp ?? DateTime.now();

  Map<String, dynamic> toJson() => {
    'id': id,
    'timestamp': timestamp.toIso8601String(),
    'location': location.toJson(),
    'vehicles': vehicles.map((v) => v.toJson()).toList(),
    'mediaFiles': mediaFiles.map((m) => m.toJson()).toList(),
    'notes': notes,
    'status': status,
    'officerId': officerId,
    'syncedAt': syncedAt?.toIso8601String(),
  };

  factory AccidentReport.fromJson(Map<String, dynamic> json) => AccidentReport(
    id: json['id'] as String,
    timestamp: DateTime.parse(json['timestamp'] as String),
    location: Location.fromJson(json['location'] as Map<String, dynamic>),
    vehicles:
        (json['vehicles'] as List)
            .map((v) => Vehicle.fromJson(v as Map<String, dynamic>))
            .toList(),
    mediaFiles:
        (json['mediaFiles'] as List)
            .map((m) => MediaFile.fromJson(m as Map<String, dynamic>))
            .toList(),
    notes: json['notes'] as String?,
    status: json['status'] as String,
    officerId: json['officerId'] as String,
    syncedAt:
        json['syncedAt'] != null
            ? DateTime.parse(json['syncedAt'] as String)
            : null,
  );

  AccidentReport copyWith({
    String? id,
    DateTime? timestamp,
    Location? location,
    List<Vehicle>? vehicles,
    List<MediaFile>? mediaFiles,
    String? notes,
    String? status,
    String? officerId,
    DateTime? syncedAt,
  }) => AccidentReport(
    id: id ?? this.id,
    timestamp: timestamp ?? this.timestamp,
    location: location ?? this.location,
    vehicles: vehicles ?? this.vehicles,
    mediaFiles: mediaFiles ?? this.mediaFiles,
    notes: notes ?? this.notes,
    status: status ?? this.status,
    officerId: officerId ?? this.officerId,
    syncedAt: syncedAt ?? this.syncedAt,
  );
}

class Location {
  final double latitude;
  final double longitude;
  final String? address;
  final String? landmark;

  Location({
    required this.latitude,
    required this.longitude,
    this.address,
    this.landmark,
  });

  Map<String, dynamic> toJson() => {
    'latitude': latitude,
    'longitude': longitude,
    'address': address,
    'landmark': landmark,
  };

  factory Location.fromJson(Map<String, dynamic> json) => Location(
    latitude: json['latitude'] as double,
    longitude: json['longitude'] as double,
    address: json['address'] as String?,
    landmark: json['landmark'] as String?,
  );
}

class Vehicle {
  final String registrationNumber;
  final String make;
  final String model;
  final String color;
  final String? insuranceCompany;
  final String? insurancePolicyNumber;
  final String? driverName;
  final String? driverLicenseNumber;
  final String? driverPhoneNumber;

  Vehicle({
    required this.registrationNumber,
    required this.make,
    required this.model,
    required this.color,
    this.insuranceCompany,
    this.insurancePolicyNumber,
    this.driverName,
    this.driverLicenseNumber,
    this.driverPhoneNumber,
  });

  Map<String, dynamic> toJson() => {
    'registrationNumber': registrationNumber,
    'make': make,
    'model': model,
    'color': color,
    'insuranceCompany': insuranceCompany,
    'insurancePolicyNumber': insurancePolicyNumber,
    'driverName': driverName,
    'driverLicenseNumber': driverLicenseNumber,
    'driverPhoneNumber': driverPhoneNumber,
  };

  factory Vehicle.fromJson(Map<String, dynamic> json) => Vehicle(
    registrationNumber: json['registrationNumber'] as String,
    make: json['make'] as String,
    model: json['model'] as String,
    color: json['color'] as String,
    insuranceCompany: json['insuranceCompany'] as String?,
    insurancePolicyNumber: json['insurancePolicyNumber'] as String?,
    driverName: json['driverName'] as String?,
    driverLicenseNumber: json['driverLicenseNumber'] as String?,
    driverPhoneNumber: json['driverPhoneNumber'] as String?,
  );
}

class MediaFile {
  final String id;
  final String path;
  final MediaType type;
  final DateTime timestamp;
  final String? thumbnailPath;

  MediaFile({
    String? id,
    required this.path,
    required this.type,
    DateTime? timestamp,
    this.thumbnailPath,
  }) : id = id ?? const Uuid().v4(),
       timestamp = timestamp ?? DateTime.now();

  Map<String, dynamic> toJson() => {
    'id': id,
    'path': path,
    'type': type.toString(),
    'timestamp': timestamp.toIso8601String(),
    'thumbnailPath': thumbnailPath,
  };

  factory MediaFile.fromJson(Map<String, dynamic> json) => MediaFile(
    id: json['id'] as String,
    path: json['path'] as String,
    type: MediaType.values.firstWhere((e) => e.toString() == json['type']),
    timestamp: DateTime.parse(json['timestamp'] as String),
    thumbnailPath: json['thumbnailPath'] as String?,
  );
}

enum MediaType { image, video }
