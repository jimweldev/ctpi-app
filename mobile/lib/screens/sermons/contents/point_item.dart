import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/interceptors/private_instance.dart';

class PointItem extends StatefulWidget {
  const PointItem({
    Key? key,
    required this.sermonId,
    required this.pointId,
  }) : super(key: key);

  final String sermonId;
  final String pointId;

  @override
  State<PointItem> createState() => _PointItemState();
}

class _PointItemState extends State<PointItem> {
  final Dio _dio = PrivateInstance().dio;

  @override
  void initState() {
    super.initState();
    _fetchSermonPoint();
    _fetchSermonPointVerses();
  }

  @override
  void dispose() {
    super.dispose();
  }

  Map<String, dynamic>? point;
  List<Map<String, dynamic>>? verses;

  Future<void> _fetchSermonPoint() async {
    try {
      final response = await _dio.get('/api/points/${widget.pointId}');
      setState(() {
        point = response.data;
      });
    } catch (e) {
      print('Error fetching sermon data: $e');
    }
  }

  Future<void> _fetchSermonPointVerses() async {
    try {
      final response = await _dio.get(
        '/api/verses',
        queryParameters: {
          'pointId': widget.pointId,
          'sort': 'order',
        },
      );
      setState(() {
        verses = List<Map<String, dynamic>>.from(response.data['records']);
      });
    } catch (e) {
      print('Error fetching sermon data: $e');
    }
  }

  void navigateToPoint(String pointId) {
    context.pushReplacement('/sermons/${widget.sermonId}/$pointId');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(point != null
            ? "${intToRoman(point!['order'])}. ${point!['title']}"
            : ''),
        actions: [
          IconButton(
            icon: const Icon(Icons.skip_previous),
            onPressed: point?['prevPointId'] != null
                ? () => navigateToPoint(point!['prevPointId'])
                : null,
          ),
          IconButton(
            icon: const Icon(Icons.skip_next),
            onPressed: point?['nextPointId'] != null
                ? () => navigateToPoint(point!['nextPointId'])
                : null,
          ),
        ],
      ),
      body: Container(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
        child: verses != null
            ? ListView.builder(
                itemCount: verses!.length,
                itemBuilder: (context, index) {
                  final verse = verses![index];
                  return Container(
                    margin: const EdgeInsets.symmetric(vertical: 8),
                    child: Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              verse['title'],
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(
                              height: 8,
                            ),
                            Html(
                              data: verse['description'],
                              style: {
                                "body": Style(margin: Margins.all(0)),
                                "body > :first-child": Style(
                                  margin: Margins.only(top: 0),
                                ),
                              },
                            )
                          ],
                        ),
                      ),
                    ),
                  );
                },
              )
            : const Center(
                child: CircularProgressIndicator.adaptive(),
              ),
      ),
    );
  }
}

const List<int> arabianRomanNumbers = [
  1000,
  900,
  500,
  400,
  100,
  90,
  50,
  40,
  10,
  9,
  5,
  4,
  1
];

const List<String> romanNumbers = [
  "M",
  "CM",
  "D",
  "CD",
  "C",
  "XC",
  "L",
  "XL",
  "X",
  "IX",
  "V",
  "IV",
  "I"
];

String intToRoman(int input) {
  if (input <= 0) {
    return "nulla";
  }

  final builder = StringBuffer();
  var num = input;

  for (var a = 0; a < arabianRomanNumbers.length; a++) {
    final times = (num / arabianRomanNumbers[a]).truncate();
    builder.write(romanNumbers[a] * times);
    num -= times * arabianRomanNumbers[a];
  }

  return builder.toString();
}
