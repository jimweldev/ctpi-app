import 'package:mobile/screens/sermons/contents/point_item.dart';
import 'package:mobile/screens/sermons/sermon_item.dart';
import 'package:mobile/theme/theme_provider.dart';
import 'package:provider/provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';

import 'package:mobile/screens/main_nav.dart';

Future main() async {
  WidgetsFlutterBinding.ensureInitialized();

  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  await Future.delayed(const Duration(seconds: 1, milliseconds: 500));
  FlutterNativeSplash.remove();

  runApp(ChangeNotifierProvider(
    create: (context) => ThemeProvider(),
    child: const MyApp(),
  ));
}

final GoRouter _router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) {
        return const MainNav();
      },
    ),
    GoRoute(
      path: '/sermons/:sermonId',
      builder: (context, state) {
        return SermonItem(sermonId: state.pathParameters['sermonId']!);
      },
      routes: [
        GoRoute(
          path: ':pointId',
          builder: (context, state) {
            return PointItem(
                sermonId: state.pathParameters['sermonId']!,
                pointId: state.pathParameters['pointId']!);
          },
        ),
      ],
    ),
  ],
);

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'CTPI',
      debugShowCheckedModeBanner: false,
      routerConfig: _router,
      theme: Provider.of<ThemeProvider>(context).themeData,
    );
  }
}
