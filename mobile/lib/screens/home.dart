import 'package:mobile/theme/theme.dart';
import 'package:mobile/theme/theme_provider.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class Home extends StatelessWidget {
  const Home({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Home'),
        actions: [
          IconButton(
            icon: Provider.of<ThemeProvider>(context).themeData == lightMode
                ? const Icon(Icons.light_mode)
                : const Icon(Icons.dark_mode),
            onPressed: () => Provider.of<ThemeProvider>(context, listen: false)
                .toggleTheme(),
            color: Provider.of<ThemeProvider>(context).themeData == lightMode
                ? Colors.yellow.shade300
                : Colors.white60,
          ),
        ],
      ),
      body: const Center(
        child: Text('Home'),
      ),
    );
  }
}
