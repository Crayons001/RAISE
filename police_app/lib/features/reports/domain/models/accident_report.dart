import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:uuid/uuid.dart';

class AccidentReport {
  final String id;
  final String officerId;
  final DateTime timestamp;
  final String location;
  final GeoPoint coordinates;
  final List<String> imageUrls;
  final List<Vehicle> vehicles;
  final List<Person> witnesses;
  final String description;
  final String status;
  final Map<String, dynamic> additionalDetails;

  AccidentReport({
    String? id,
    required this.officerId,
    DateTime? timestamp,
    required this.location,
    required this.coordinates,
    List<String>? imageUrls,
    required this.vehicles,
    List<Person>? witnesses,
    required this.description,
    this.status = 'draft',
    Map<String, dynamic>? additionalDetails,
  })  : id = id ?? const Uuid().v4(),
        timestamp = timestamp ?? DateTime.now(),
        imageUrls = imageUrls ?? [],
        witnesses = witnesses ?? [],
        additionalDetails = additionalDetails ?? {};

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'officerId': officerId,
      'timestamp': timestamp,
      'location': location,
      'coordinates': coordinates,
      'imageUrls': imageUrls,
      'vehicles': vehicles.map((v) => v.toJson()).toList(),
      'witnesses': witnesses.map((w) => w.toJson()).toList(),
      'description': description,
      'status': status,
      'additionalDetails': additionalDetails,
    };
  }

  factory AccidentReport.fromJson(Map<String, dynamic> json) {
    return AccidentReport(
      id: json['id'] as String,
      officerId: json['officerId'] as String,
      timestamp: (json['timestamp'] as Timestamp).toDate(),
      location: json['location'] as String,
      coordinates: json['coordinates'] as GeoPoint,
      imageUrls: List<String>.from(json['imageUrls'] as List),
      vehicles: (json['vehicles'] as List)
          .map((v) => Vehicle.fromJson(v as Map<String, dynamic>))
          .toList(),
      witnesses: (json['witnesses'] as List)
          .map((w) => Person.fromJson(w as Map<String, dynamic>))
          .toList(),
      description: json['description'] as String,
      status: json['status'] as String,
      additionalDetails: json['additionalDetails'] as Map<String, dynamic>,
    );
  }

  AccidentReport copyWith({
    String? officerId,
    DateTime? timestamp,
    String? location,
    GeoPoint? coordinates,
    List<String>? imageUrls,
    List<Vehicle>? vehicles,
    List<Person>? witnesses,
    String? description,
    String? status,
    Map<String, dynamic>? additionalDetails,
  }) {
    return AccidentReport(
      id: id,
      officerId: officerId ?? this.officerId,
      timestamp: timestamp ?? this.timestamp,
      location: location ?? this.location,
      coordinates: coordinates ?? this.coordinates,
      imageUrls: imageUrls ?? this.imageUrls,
      vehicles: vehicles ?? this.vehicles,
      witnesses: witnesses ?? this.witnesses,
      description: description ?? this.description,
      status: status ?? this.status,
      additionalDetails: additionalDetails ?? this.additionalDetails,
    );
  }
}

class Vehicle {
  final String registrationNumber;
  final String make;
  final String model;
  final String color;
  final Person? driver;
  final List<Person> passengers;
  final String damageDescription;
  final List<String> damageImageUrls;

  Vehicle({
    required this.registrationNumber,
    required this.make,
    required this.model,
    required this.color,
    this.driver,
    List<Person>? passengers,
    required this.damageDescription,
    List<String>? damageImageUrls,
  })  : passengers = passengers ?? [],
        damageImageUrls = damageImageUrls ?? [];

  Map<String, dynamic> toJson() {
    return {
      'registrationNumber': registrationNumber,
      'make': make,
      'model': model,
      'color': color,
      'driver': driver?.toJson(),
      'passengers': passengers.map((p) => p.toJson()).toList(),
      'damageDescription': damageDescription,
      'damageImageUrls': damageImageUrls,
    };
  }

  factory Vehicle.fromJson(Map<String, dynamic> json) {
    return Vehicle(
      registrationNumber: json['registrationNumber'] as String,
      make: json['make'] as String,
      model: json['model'] as String,
      color: json['color'] as String,
      driver: json['driver'] != null
          ? Person.fromJson(json['driver'] as Map<String, dynamic>)
          : null,
      passengers: (json['passengers'] as List)
          .map((p) => Person.fromJson(p as Map<String, dynamic>))
          .toList(),
      damageDescription: json['damageDescription'] as String,
      damageImageUrls: List<String>.from(json['damageImageUrls'] as List),
    );
  }
}

class Person {
  final String name;
  final String? phoneNumber;
  final String? email;
  final String? address;
  final String? licenseNumber;
  final String? idNumber;

  Person({
    required this.name,
    this.phoneNumber,
    this.email,
    this.address,
    this.licenseNumber,
    this.idNumber,
  });

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'phoneNumber': phoneNumber,
      'email': email,
      'address': address,
      'licenseNumber': licenseNumber,
      'idNumber': idNumber,
    };
  }

  factory Person.fromJson(Map<String, dynamic> json) {
    return Person(
      name: json['name'] as String,
      phoneNumber: json['phoneNumber'] as String?,
      email: json['email'] as String?,
      address: json['address'] as String?,
      licenseNumber: json['licenseNumber'] as String?,
      idNumber: json['idNumber'] as String?,
    );
  }
}
