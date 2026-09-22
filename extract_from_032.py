import json
import re

tpath = "/Users/mac/.gemini/antigravity/brain/032b8a46-409a-458d-a474-38bd53828614/.system_generated/logs/transcript_full.jsonl"
viewed = {}
written = {}

with open(tpath, 'r') as f:
    for line in f:
        try:
            entry = json.loads(line)
        except:
            continue
        
        # Check tool calls
        for call in entry.get('tool_calls', []):
            if call.get('name') == 'write_to_file':
                args = call.get('args', {})
                if isinstance(args, str):
                    try: args = json.loads(args)
                    except: continue
                target = args.get('TargetFile', '')
                content = args.get('CodeContent', '')
                if target and content:
                    written[target] = len(content)

        # Check content for view_file
        content = entry.get('content', '')
        if 'File Path: `file:///Users/mac/Downloads/forex-signals---' in content:
            m = re.search(r'File Path: `file:///Users/mac/Downloads/forex-signals---[^/]+/(.*?)`', content)
            if m:
                p = m.group(1)
                viewed[p] = len(content)

print("Written in 032:")
for k, v in written.items():
    print(f"  {k} ({v} bytes)")

print("\nViewed in 032:")
for k, v in viewed.items():
    print(f"  {k} ({v} bytes)")
