import os
import glob
import json
from datetime import datetime

brain_dir = "/Users/mac/.gemini/antigravity/brain/"
conv_info = []

for transcript_path in glob.glob(brain_dir + "*/.system_generated/logs/transcript_full.jsonl"):
    cid = transcript_path.split('/')[6]
    first_time = ""
    first_user_prompt = ""
    has_forex = False
    
    with open(transcript_path, 'r') as f:
        for line in f:
            if 'forex-signals' in line:
                has_forex = True
            if not first_time and 'created_at' in line:
                try:
                    entry = json.loads(line)
                    first_time = entry.get('created_at', '')
                except:
                    pass
            if not first_user_prompt and '"type":"USER_INPUT"' in line:
                try:
                    entry = json.loads(line)
                    first_user_prompt = entry.get('content', '')[:80].replace('\n', ' ')
                except:
                    pass
            if first_time and first_user_prompt and has_forex:
                break
                
    if has_forex:
        conv_info.append((first_time, cid, first_user_prompt))

conv_info.sort()
print(f"Total forex conversations: {len(conv_info)}")
for t, cid, p in conv_info:
    print(f"{t} | {cid} | {p}")
