import 'package:flutter/material.dart';
import 'package:mobile/theme/theme.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ThemeProvider with ChangeNotifier {
  late ThemeData _themeData;

  // Constructor to initialize the theme based on the stored value
  ThemeProvider() {
    // Initialize with a default theme (you can change this)
    _themeData = lightMode;
    // Retrieve the theme from SharedPreferences
    retrieveData().then((value) {
      if (value == 'lightMode') {
        setTheme(lightMode);
      } else if (value == 'darkMode') {
        setTheme(darkMode);
      }
    });
  }

  ThemeData get themeData => _themeData;

  setTheme(ThemeData themeData) {
    _themeData = themeData;
    notifyListeners();
  }

  Future<String?> retrieveData() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    return prefs.getString('theme');
  }

  Future<void> storeData(String value) async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    prefs.setString('theme', value);
  }

  void toggleTheme() {
    if (_themeData == lightMode) {
      setTheme(darkMode);
      storeData('darkMode');
    } else {
      setTheme(lightMode);
      storeData('lightMode');
    }
  }
}
