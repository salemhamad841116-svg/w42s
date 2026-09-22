import json
import re
import os

transcript_path = "/Users/mac/.gemini/antigravity/brain/0c4455f2-aab9-41a1-8f8d-a24f2e1dd372/.system_generated/logs/transcript_full.jsonl"
recovered = {}

with open(transcript_path, 'r') as f:
    for line in f:
        try:
            entry = json.loads(line)
        except:
            continue
        
        content = entry.get('content', '')
        if 'File Path: `file:///Users/mac/Downloads/forex-signals---' in content:
            m_path = re.search(r'File Path: `file:///Users/mac/Downloads/forex-signals---[^/]+/(.*?)`', content)
            if m_path:
                rel_path = m_path.group(1)
                lines = []
                for cl in content.split('\n'):
                    m_line = re.match(r'^\s*(\d+):\s?(.*)$', cl)
                    if m_line:
                        lines.append(m_line.group(2))
                if lines:
                    recovered[rel_path] = '\n'.join(lines)

for path, code in recovered.items():
    if 'node_modules' in path: continue
    dir_name = os.path.dirname(path)
    if dir_name:
        os.makedirs(dir_name, exist_ok=True)
    with open(path, 'w') as out:
        out.write(code)
    print(f"Wrote {path}")
