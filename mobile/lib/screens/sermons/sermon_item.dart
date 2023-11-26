import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:mobile/interceptors/private_instance.dart';
import 'package:mobile/screens/sermons/contents/content_nav.dart';
import 'package:mobile/theme/theme.dart';
import 'package:mobile/theme/theme_provider.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';

class SermonItem extends StatefulWidget {
  const SermonItem({super.key, required this.sermonId});

  final String sermonId;

  @override
  State<SermonItem> createState() => _SermonItemState();
}

class _SermonItemState extends State<SermonItem> {
  final Dio _dio = PrivateInstance().dio;

  Map<String, dynamic>? sermon;

  @override
  void initState() {
    super.initState();
    _fetchSermonData();
  }

  Future<void> _fetchSermonData() async {
    try {
      final response = await _dio.get('/api/sermons/${widget.sermonId}');
      setState(() {
        sermon = response.data;
      });
    } catch (e) {
      // print('Error fetching sermon data: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      initialIndex: 0,
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: Text(sermon != null ? sermon!['title'] : ''),
          bottom: TabBar(
            tabs: const [
              Tab(icon: Icon(Icons.info_outline)),
              Tab(icon: Icon(Icons.format_list_bulleted_sharp)),
              Tab(icon: Icon(Icons.notes)),
            ],
            indicatorColor:
                Provider.of<ThemeProvider>(context).themeData == lightMode
                    ? Colors.white
                    : Colors.grey.shade600,
            labelColor:
                Provider.of<ThemeProvider>(context).themeData == lightMode
                    ? Colors.white
                    : Colors.grey.shade600,
          ),
        ),
        body: sermon != null
            ? TabBarView(children: [
                SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        sermon!['title'] ?? '',
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(
                        height: 8,
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Text(
                              sermon!['seriesId']['title'] ?? '',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 20),
                          Text(
                            sermon!['date'] != ''
                                ? DateFormat('MMM. dd, yyyy')
                                    .format(DateTime.parse(sermon!['date']))
                                : '',
                            style: const TextStyle(
                              fontFamily: 'Monospace',
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(
                        height: 16,
                      ),
                      Text(
                        sermon!['description'],
                        style: const TextStyle(fontSize: 16),
                      ),
                    ],
                  ),
                ),
                ContentNav(widget.sermonId),
                SingleChildScrollView(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Html(
                      data: sermon!['notes'] ?? '',
                      style: {
                        "body": Style(margin: Margins.all(0)),
                        "body > :first-child": Style(
                          margin: Margins.only(top: 0),
                        ),
                      },
                    ),
                  ),
                ),
              ])
            : const Center(
                child: CircularProgressIndicator.adaptive(),
              ),
      ),
    );
  }
}
