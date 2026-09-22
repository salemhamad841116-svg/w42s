import json
import glob

brain_dir = "/Users/mac/.gemini/antigravity/brain/"
forex_convs = set()

for transcript_path in glob.glob(brain_dir + "*/.system_generated/logs/transcript_full.jsonl"):
    with open(transcript_path, 'r') as f:
        for line in f:
            if 'forex-signals' in line:
                conv_id = transcript_path.split('/')[6]
                forex_convs.add(conv_id)
                break

print("Conversations with forex-signals:", forex_convs)

all_written_files = {}

for conv_id in forex_convs:
    tpath = f"{brain_dir}{conv_id}/.system_generated/logs/transcript_full.jsonl"
    with open(tpath, 'r') as f:
        for line in f:
            if 'write_to_file' not in line:
                continue
            try:
                entry = json.loads(line)
            except:
                continue
            for call in entry.get('tool_calls', []):
                if call.get('name') == 'write_to_file':
                    args = call.get('args', {})
                    if isinstance(args, str):
                        try: args = json.loads(args)
                        except: continue
                    target = args.get('TargetFile', '')
                    content = args.get('CodeContent', '')
                    if target and content and 'forex-signals' in target:
                        all_written_files[target] = (len(content), conv_id)

print(f"\nTotal unique files written across all forex conversations: {len(all_written_files)}")
for path, (sz, cid) in sorted(all_written_files.items()):
    print(f"  [{cid[:8]}] {path} ({sz} bytes)")
