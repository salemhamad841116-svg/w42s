import json
import re
import os

tpath = "/Users/mac/.gemini/antigravity/brain/032b8a46-409a-458d-a474-38bd53828614/.system_generated/logs/transcript_full.jsonl"
recovered = {}

with open(tpath, 'r') as f:
    for line in f:
        try:
            entry = json.loads(line)
        except:
            continue
        
        # Check write_to_file
        for call in entry.get('tool_calls', []):
            if call.get('name') == 'write_to_file':
                args = call.get('args', {})
                if isinstance(args, str):
                    try: args = json.loads(args)
                    except: continue
                target = args.get('TargetFile', '')
                content = args.get('CodeContent', '')
                if target and content and 'forex-signals' in target:
                    rel = target.split('forex-signals---')[1].split('/', 1)[1]
                    recovered[rel] = content

        # Check view_file
        content = entry.get('content', '')
        if 'File Path: `file:///Users/mac/Downloads/forex-signals---' in content:
            m = re.search(r'File Path: `file:///Users/mac/Downloads/forex-signals---[^/]+/(.*?)`', content)
            if m:
                rel = m.group(1)
                # Only if not already in write_to_file
                lines = []
                for cl in content.split('\n'):
                    m_line = re.match(r'^\s*(\d+):\s?(.*)$', cl)
                    if m_line:
                        lines.append(m_line.group(2))
                if lines and rel not in recovered:
                    recovered[rel] = '\n'.join(lines)

print(f"Total recovered from 032: {len(recovered)}")
for path, code in recovered.items():
    print(f"  {path} ({len(code)} bytes)")
    # Let's save them to a backup folder first
    dest = os.path.join("recovered_from_032", path)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with open(dest, 'w') as f:
        f.write(code)

print("Saved to recovered_from_032/")
