import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:infinite_scroll_pagination/infinite_scroll_pagination.dart';
import 'package:mobile/interceptors/private_instance.dart';
import 'package:intl/intl.dart';

class SermonList extends StatefulWidget {
  const SermonList({super.key});

  @override
  State<SermonList> createState() => _SermonListState();
}

class _SermonListState extends State<SermonList> {
  final PagingController<int, Sermon> _pagingController =
      PagingController(firstPageKey: 1);
  final Dio _dio = PrivateInstance().dio;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _pagingController.addPageRequestListener((pageKey) {
      _fetchPage(pageKey, searchTerm: _searchController.text);
    });
  }

  Future<void> _fetchPage(int pageKey, {String? searchTerm}) async {
    try {
      final response = await _dio.get(
        '/api/sermons/paginated',
        queryParameters: {
          'limit': 10,
          'page': pageKey,
          'search': searchTerm,
          'sort': '-date',
        },
      );

      if (response.statusCode == 200) {
        final List<Sermon> sermons = (response.data['records'] as List)
            .map((data) => Sermon(
                id: data['_id'],
                title: data['title'],
                description: data['description'],
                series: data['seriesId']['title'],
                date: data['date']))
            .toList();

        if (sermons.isEmpty) {
          _pagingController.appendPage([], null);
        } else {
          _pagingController.appendPage(sermons, pageKey + 1);
        }
      } else {
        _pagingController.error = Exception('Failed to fetch data');
      }
    } catch (error) {
      _pagingController.error = error;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: TextField(
          controller: _searchController,
          onChanged: (value) {
            _pagingController.refresh();
          },
          decoration: const InputDecoration(
            border: InputBorder.none,
            hintText: "Search for sermons...",
            prefixIcon: Icon(Icons.search),
          ),
        ),
      ),
      body: Container(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
        child: PagedListView<int, Sermon>(
          pagingController: _pagingController,
          builderDelegate: PagedChildBuilderDelegate<Sermon>(
            itemBuilder: (context, sermon, index) {
              return GestureDetector(
                onTap: () => context.push('/sermons/${sermon.id}'),
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  child: Card(
                    child: Column(children: [
                      ListTile(
                        title: Text(
                          sermon.title,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        subtitle: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              child: Text(
                                sermon.series,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            const SizedBox(
                                width: 20), // Add space between texts
                            Text(
                              DateFormat('MMM. dd, yyyy')
                                  .format(DateTime.parse(sermon.date)),
                              style: const TextStyle(
                                fontFamily: 'Monospace',
                              ),
                            ),
                          ],
                        ),
                        trailing: Container(
                          padding: const EdgeInsets.all(8.0),
                          decoration: BoxDecoration(
                            // color: Colors.grey.shade700,
                            borderRadius: BorderRadius.circular(5.0),
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
            noMoreItemsIndicatorBuilder: (_) => Container(
              padding: const EdgeInsets.symmetric(vertical: 16),
              alignment: Alignment.center,
              child: const Text(
                'End of results',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
            noItemsFoundIndicatorBuilder: (_) => Container(
              padding: const EdgeInsets.symmetric(vertical: 16),
              alignment: Alignment.center,
              child: const Text(
                'No items found',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class Sermon {
  final String id;
  final String title;
  final String description;
  final String series;
  final String date;

  Sermon(
      {required this.id,
      required this.title,
      required this.description,
      required this.series,
      required this.date});
}
