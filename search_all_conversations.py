import json
import os
import glob

brain_dir = "/Users/mac/.gemini/antigravity/brain/"
print("Searching across all brain transcripts...")

found_files = {}

for transcript_path in glob.glob(brain_dir + "*/.system_generated/logs/transcript_full.jsonl"):
    with open(transcript_path, 'r') as f:
        for line in f:
            if 'write_to_file' not in line and 'Admin' not in line:
                continue
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
                    if ('Admin' in target or 'admin' in target or 'src/components/admin' in target or 'data/' in target) and content:
                        found_files[target] = (len(content), transcript_path)

print(f"Found {len(found_files)} files written in transcripts:")
for k, v in found_files.items():
    print(f"  {k} ({v[0]} bytes) in {v[1].split('/')[6]}")
