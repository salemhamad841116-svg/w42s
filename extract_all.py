import json
import os
import glob

brain_dir = "/Users/mac/.gemini/antigravity/brain/"
file_contents = {}

for transcript_path in glob.glob(brain_dir + "*/.system_generated/logs/transcript_full.jsonl"):
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
    if 'src/' in path:
        rel_path = path[path.find('src/'):]
        os.makedirs(os.path.dirname(rel_path), exist_ok=True)
        with open(rel_path, 'w') as f:
            f.write(content)
        print(f"Restored {rel_path} from subagents")

print(f"Total files restored: {len(file_contents)}")
