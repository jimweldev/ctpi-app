import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:mobile/interceptors/private_instance.dart';
import 'package:mobile/theme/theme.dart';
import 'package:mobile/theme/theme_provider.dart';
import 'package:provider/provider.dart';

class ContentNav extends StatefulWidget {
  const ContentNav(this.sermonId, {super.key});

  final String sermonId;

  @override
  State<ContentNav> createState() => _ContentNavState();
}

class _ContentNavState extends State<ContentNav> with TickerProviderStateMixin {
  final Dio _dio = PrivateInstance().dio;

  late final TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _fetchSermonOpenings();
    _fetchSermonClosings();
    _fetchSermonPoints();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  List<Map<String, dynamic>>? openings;
  List<Map<String, dynamic>>? closings;
  List<Map<String, dynamic>>? points;

  Future<void> _fetchSermonOpenings() async {
    try {
      final response = await _dio.get(
        '/api/openings',
        queryParameters: {
          'sermonId': widget.sermonId,
          'sort': 'order',
        },
      );
      setState(() {
        openings = List<Map<String, dynamic>>.from(response.data['records']);
      });
    } catch (e) {
      // print('Error fetching sermon data: $e');
    }
  }

  Future<void> _fetchSermonClosings() async {
    try {
      final response = await _dio.get(
        '/api/closings',
        queryParameters: {
          'sermonId': widget.sermonId,
          'sort': 'order',
        },
      );
      setState(() {
        closings = List<Map<String, dynamic>>.from(response.data['records']);
      });
    } catch (e) {
      // print('Error fetching sermon data: $e');
    }
  }

  Future<void> _fetchSermonPoints() async {
    try {
      final response = await _dio.get(
        '/api/points',
        queryParameters: {
          'sermonId': widget.sermonId,
          'sort': 'order',
        },
      );
      setState(() {
        points = List<Map<String, dynamic>>.from(response.data['records']);
      });
    } catch (e) {
      // print('Error fetching sermon data: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        TabBar.secondary(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Opening'),
            Tab(text: 'Points'),
            Tab(text: 'Closing'),
          ],
          indicatorColor:
              Provider.of<ThemeProvider>(context).themeData == lightMode
                  ? Theme.of(context).colorScheme.secondary
                  : Colors.grey.shade600,
          labelColor: Provider.of<ThemeProvider>(context).themeData == lightMode
              ? Theme.of(context).colorScheme.tertiary
              : Colors.grey.shade600,
          unselectedLabelColor:
              Provider.of<ThemeProvider>(context).themeData == lightMode
                  ? Theme.of(context).colorScheme.secondary
                  : Colors.grey.shade600,
        ),
        Expanded(
          child: TabBarView(
            controller: _tabController,
            children: [
              // OPENING
              Container(
                padding:
                    const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                child: openings != null
                    ? ListView.builder(
                        itemCount: openings!.length,
                        itemBuilder: (context, index) {
                          final opening = openings![index];
                          return Container(
                            margin: const EdgeInsets.symmetric(vertical: 8),
                            child: Card(
                              child: Padding(
                                padding: const EdgeInsets.all(16),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      opening['title'],
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    const SizedBox(
                                      height: 8,
                                    ),
                                    Html(
                                      data: opening['description'],
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

              // POINTS
              Container(
                padding:
                    const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                child: points != null
                    ? ListView.builder(
                        itemCount: points!.length,
                        itemBuilder: (context, index) {
                          final point = points![index];
                          return GestureDetector(
                            onTap: () => context.push(
                                "/sermons/${widget.sermonId}/${point['_id']}"),
                            child: Container(
                              margin: const EdgeInsets.symmetric(vertical: 8),
                              child: Card(
                                child: Column(children: [
                                  ListTile(
                                    title: Text(
                                      "${intToRoman(point['order'])}. ${point['title']}",
                                    ),
                                    trailing: Container(
                                      padding: const EdgeInsets.all(8.0),
                                      decoration: BoxDecoration(
                                        // color: Colors.grey.shade700,
                                        borderRadius:
                                            BorderRadius.circular(5.0),
                                      ),
                                      child: const Icon(
                                        Icons.arrow_forward,
                                        color: Colors.white,
                                      ),
                                    ),
                                  ),
                                ]),
                              ),
                            ),
                          );
                        },
                      )
                    : const Center(
                        child: CircularProgressIndicator.adaptive(),
                      ),
              ),

              // CLOSING
              Container(
                padding:
                    const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                child: closings != null
                    ? ListView.builder(
                        itemCount: closings!.length,
                        itemBuilder: (context, index) {
                          final closing = closings![index];
                          return Container(
                            margin: const EdgeInsets.symmetric(vertical: 8),
                            child: Card(
                              child: Padding(
                                padding: const EdgeInsets.all(16),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      closing['title'],
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    const SizedBox(
                                      height: 8,
                                    ),
                                    Html(
                                      data: closing['description'],
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
            ],
          ),
        ),
      ],
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
