import json
import os

transcript_path = "/Users/mac/.gemini/antigravity/brain/0c4455f2-aab9-41a1-8f8d-a24f2e1dd372/.system_generated/logs/transcript_full.jsonl"
file_contents = {}

with open(transcript_path, 'r') as f:
    for line in f:
        try:
            entry = json.loads(line)
        except:
            continue
            
        if 'tool_calls' in entry:
            for call in entry['tool_calls']:
                if call['name'] == 'write_to_file':
                    args = call.get('args', {})
                    if isinstance(args, str):
                        try: args = json.loads(args)
                        except: continue
                    target = args.get('TargetFile')
                    content = args.get('CodeContent')
                    if target and content and 'src/' in target:
                        file_contents[target] = content
                elif call['name'] == 'replace_file_content':
                    args = call.get('args', {})
                    if isinstance(args, str):
                        try: args = json.loads(args)
                        except: continue
                    target = args.get('TargetFile')
                    target_content = args.get('TargetContent')
                    replacement_content = args.get('ReplacementContent')
                    if target and target_content and replacement_content and target in file_contents:
                        file_contents[target] = file_contents[target].replace(target_content, replacement_content)

for path, content in file_contents.items():
    rel_path = path[path.find('src/'):]
    os.makedirs(os.path.dirname(rel_path), exist_ok=True)
    with open(rel_path, 'w') as f:
        f.write(content)
    print(f"Restored {rel_path}")

print(f"Restored {len(file_contents)} files.")
