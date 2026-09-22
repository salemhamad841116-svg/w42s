import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:firebase_auth/firebase_auth.dart';
import '../models/chat_message.dart';
import 'local_storage.dart';

class ApiService {
  // Replace with your actual backend URL
  static const String _baseUrl = 'http://10.0.2.2:3000/api'; 
  final LocalStorage _storage = LocalStorage();

  Future<String?> _getToken() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user != null) {
      return await user.getIdToken();
    }
    return null;
  }

  Future<String> sendMessage(String text) async {
    final token = await _getToken();
    if (token == null) {
      throw Exception('User not authenticated');
    }

    // Fetch last 4 messages for context (excluding the new message which isn't saved yet)
    final allMessages = await _storage.getMessages();
    final recentMessages = allMessages.length > 4 
        ? allMessages.sublist(allMessages.length - 4) 
        : allMessages;

    List<String> context = recentMessages.map((msg) {
      return msg.isUser ? "المستخدم: ${msg.text}" : "المساعد: ${msg.text}";
    }).toList();

    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/chat'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'message': text,
          'context': context,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['reply'];
      } else if (response.statusCode == 403 || response.statusCode == 429) {
        final data = jsonDecode(response.body);
        throw QuotaExceededException(data['error'] ?? 'انتهت الحصة اليومية');
      } else if (response.statusCode == 401) {
        throw Exception('غير مصرح. يرجى تسجيل الدخول مجدداً.');
      } else {
        throw Exception('حدث خطأ في الاتصال، يرجى المحاولة لاحقاً');
      }
    } catch (e) {
      if (e is QuotaExceededException) rethrow;
      throw Exception('حدث خطأ في الاتصال، يرجى المحاولة لاحقاً');
    }
  }
}

class QuotaExceededException implements Exception {
  final String message;
  QuotaExceededException(this.message);
}
