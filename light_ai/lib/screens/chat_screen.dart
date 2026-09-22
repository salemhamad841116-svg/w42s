import 'package:flutter/material.dart';
import '../models/chat_message.dart';
import '../widgets/chat_bubble.dart';
import '../services/local_storage.dart';
import '../services/api_service.dart';
import 'package:firebase_auth/firebase_auth.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _controller = TextEditingController();
  final List<ChatMessage> _messages = [];
  final ScrollController _scrollController = ScrollController();
  final LocalStorage _storage = LocalStorage();
  
  bool _isTyping = false;
  bool _isSendButtonEnabled = false;

  @override
  void initState() {
    super.initState();
    _loadMessages();
    
    _controller.addListener(() {
      setState(() {
        _isSendButtonEnabled = _controller.text.trim().isNotEmpty;
      });
    });
  }

  Future<void> _loadMessages() async {
    final loadedMessages = await _storage.getMessages();
    setState(() {
      _messages.addAll(loadedMessages);
    });
    // Scroll to bottom after loading initial messages
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _scrollToBottom(animated: false);
    });
  }

  final ApiService _apiService = ApiService();

  Future<void> _sendMessage() async {
    if (_controller.text.trim().isEmpty) return;

    String userText = _controller.text;
    _controller.clear();
    
    final userMessage = ChatMessage(text: userText, isUser: true);
    
    setState(() {
      _messages.add(userMessage);
      _isTyping = true;
    });

    _scrollToBottom();
    
    // Save to local storage asynchronously
    await _storage.insertMessage(userMessage);

    try {
      final reply = await _apiService.sendMessage(userText);
      
      if (!mounted) return;

      final botMessage = ChatMessage(
        text: reply,
        isUser: false,
      );

      setState(() {
        _isTyping = false;
        _messages.add(botMessage);
      });
      
      _scrollToBottom();
      
      // Save bot response to local storage
      await _storage.insertMessage(botMessage);
    } catch (e) {
      if (!mounted) return;
      setState(() => _isTyping = false);
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.toString().replaceAll('Exception: ', '')),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _scrollToBottom({bool animated = true}) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        if (animated) {
          _scrollController.animateTo(
            _scrollController.position.maxScrollExtent,
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeOut,
          );
        } else {
          _scrollController.jumpTo(_scrollController.position.maxScrollExtent);
        }
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('المساعد الذكي', style: TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await FirebaseAuth.instance.signOut();
            },
            tooltip: 'تسجيل الخروج',
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length + (_isTyping ? 1 : 0),
              itemBuilder: (context, index) {
                if (index == _messages.length && _isTyping) {
                  return const Align(
                    alignment: Alignment.centerLeft,
                    child: Padding(
                      padding: EdgeInsets.only(bottom: 12),
                      child: Text("المساعد يكتب...", style: TextStyle(color: Colors.grey)),
                    ),
                  );
                }
                return ChatBubble(message: _messages[index]);
              },
            ),
          ),
          _buildMessageInput(),
        ],
      ),
    );
  }

  Widget _buildMessageInput() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, -2),
          )
        ],
      ),
      child: SafeArea(
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: _controller,
                maxLength: 500,
                decoration: InputDecoration(
                  hintText: 'اكتب رسالتك...',
                  counterText: "", // إخفاء العداد
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(25),
                    borderSide: BorderSide.none,
                  ),
                  filled: true,
                  fillColor: Colors.grey[200],
                  contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                ),
                onSubmitted: (_) {
                  if (_isSendButtonEnabled) _sendMessage();
                },
              ),
            ),
            const SizedBox(width: 8),
            CircleAvatar(
              backgroundColor: _isSendButtonEnabled 
                  ? Theme.of(context).colorScheme.primary 
                  : Colors.grey,
              child: IconButton(
                icon: const Icon(Icons.send, color: Colors.white),
                onPressed: _isSendButtonEnabled ? _sendMessage : null,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
