import 'package:flutter/material.dart';

class Sermon extends StatefulWidget {
  const Sermon({super.key});

  @override
  State<Sermon> createState() => _SermonState();
}

class _SermonState extends State<Sermon> {
  final sermonId = '6559abba9fa4bfa57d4265f5';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Sermon')),
      body: const Row(
        children: [
          Text('Title'),
          Text('Description'),
        ],
      ),
    );
  }
}
