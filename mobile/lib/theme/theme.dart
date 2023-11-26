import 'package:flutter/material.dart';

ThemeData lightMode = ThemeData(
  brightness: Brightness.light,
  colorScheme: const ColorScheme.light(
    primary: Color.fromRGBO(40, 12, 113, 1),
    secondary: Color.fromRGBO(252, 29, 18, 1),
    tertiary: Color.fromRGBO(253, 200, 0, 1),
    background: Color.fromRGBO(255, 253, 243, 1),
  ),
  cardColor: Colors.white,
  appBarTheme: const AppBarTheme(
    backgroundColor: Color.fromRGBO(40, 12, 113, 1),
    elevation: 0,
  ),
);

ThemeData darkMode = ThemeData(
  brightness: Brightness.dark,
  colorScheme: ColorScheme.dark(
    primary: Colors.grey.shade800,
    secondary: Colors.grey.shade800,
    tertiary: Colors.grey.shade800,
    background: Colors.grey.shade900,
  ),
  cardColor: Colors.grey.shade800,
  appBarTheme: AppBarTheme(
    backgroundColor: Colors.grey.shade900,
    elevation: 0,
  ),
);
