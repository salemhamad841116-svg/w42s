import json
import re
import os

convs = ["e9a0646f-7aec-4111-9d44-0f311fa2b8a5", "232980d1-ce2f-41bf-ba23-ca09c92dd1a6", "f3bace82-9a7e-4db8-b90f-8ac2866131e9"]
recovered = {}

for cid in convs:
    tpath = f"/Users/mac/.gemini/antigravity/brain/{cid}/.system_generated/logs/transcript_full.jsonl"
    if not os.path.exists(tpath): continue
    with open(tpath, 'r') as f:
        for line in f:
            try: entry = json.loads(line)
            except: continue
            
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
                    lines = []
                    for cl in content.split('\n'):
                        m_line = re.match(r'^\s*(\d+):\s?(.*)$', cl)
                        if m_line:
                            lines.append(m_line.group(2))
                    if lines and rel not in recovered:
                        recovered[rel] = '\n'.join(lines)

print(f"Total recovered from e9/23/f3: {len(recovered)}")
for path in sorted(recovered.keys()):
    print(f"  {path} ({len(recovered[path])} bytes)")
    dest = os.path.join("recovered_from_early", path)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with open(dest, 'w') as f:
        f.write(recovered[path])
print("Saved to recovered_from_early/")
