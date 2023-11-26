import 'package:mobile/screens/home.dart';
import 'package:mobile/theme/theme.dart';
import 'package:mobile/theme/theme_provider.dart';
import 'package:fluttertoast/fluttertoast.dart';

import 'package:mobile/screens/sermons/sermon_list.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class MainNav extends StatefulWidget {
  const MainNav({super.key});

  @override
  State<MainNav> createState() => _MainNavState();
}

class _MainNavState extends State<MainNav> {
  int currentIndex = 0;
  final screens = [const Home(), const SermonList()];

  @override
  Widget build(BuildContext context) {
    DateTime? currentBackPressTime;

    return WillPopScope(
      onWillPop: () async {
        DateTime now = DateTime.now();
        if (currentBackPressTime == null ||
            now.difference(currentBackPressTime!) >
                const Duration(seconds: 2)) {
          currentBackPressTime = now;
          Fluttertoast.showToast(msg: 'Press back again to exit');

          return false;
        }

        return true;
      },
      child: Scaffold(
        bottomNavigationBar: BottomNavigationBar(
          selectedItemColor:
              Provider.of<ThemeProvider>(context).themeData == lightMode
                  ? Theme.of(context).colorScheme.secondary
                  : Colors.grey.shade400,
          currentIndex: currentIndex,
          unselectedItemColor:
              Provider.of<ThemeProvider>(context).themeData == lightMode
                  ? Colors.grey.shade500
                  : Colors.grey.shade600,
          onTap: (value) {
            currentIndex = value;

            setState(() {});
          },
          items: const [
            BottomNavigationBarItem(
              label: 'Home',
              icon: Icon(Icons.home),
            ),
            BottomNavigationBarItem(
              label: 'Sermons',
              icon: Icon(Icons.church),
            ),
          ],
        ),
        body: screens[currentIndex],
      ),
    );
  }
}
