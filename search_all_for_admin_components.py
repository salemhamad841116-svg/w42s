import json
import glob
import re

brain_dir = "/Users/mac/.gemini/antigravity/brain/"
searched_names = [
    "AdminOverviewDashboard", "AdminUserManagement", "AdminSignalManagement",
    "AdminScreenshotAnalytics", "AdminNotificationsManager", "AdminAdvancedAnalytics",
    "AdminAuditLogs", "UserDetailModal", "SignalStatsModal", "AdminAutoEngineControl",
    "AdminEnterpriseInfrastructure", "AdminPineScriptCodeEditor", "AdminSignalHistory",
    "AdminLiveMonitoring", "AdminSystemAuditTimeline", "AdminDisasterRecovery",
    "AdminFeatureFlags", "AdminSecretsManager", "AdminErrorMonitoring", "AdminLoadTesting",
    "AdminSecurityAudit", "AdminHealthDashboard", "AdminBreakingNews", "AdminAuthGate",
    "SignalFormModal", "AutoSignalEngine", "SystemEnvironmentManager", "initialSignals",
    "mockUsersData", "translations", "sound"
]

found_contents = {}

for tpath in glob.glob(brain_dir + "*/.system_generated/logs/transcript_full.jsonl"):
    with open(tpath, 'r') as f:
        for line in f:
            for name in searched_names:
                if name in line:
                    try:
                        entry = json.loads(line)
                    except:
                        continue
                    
                    # check write_to_file
                    for call in entry.get('tool_calls', []):
                        if call.get('name') == 'write_to_file':
                            args = call.get('args', {})
                            if isinstance(args, str):
                                try: args = json.loads(args)
                                except: continue
                            tf = args.get('TargetFile', '')
                            cc = args.get('CodeContent', '')
                            if name in tf and cc:
                                found_contents[tf] = (len(cc), "write_to_file", tpath.split('/')[6])
                    
                    # check view_file in content
                    content = entry.get('content', '')
                    if name in content and 'File Path: `file:///Users/mac/Downloads/' in content:
                        m = re.search(r'File Path: `file:///Users/mac/Downloads/[^/]+/(.*?)`', content)
                        if m:
                            rf = m.group(1)
                            if rf not in found_contents:
                                found_contents[rf] = (len(content), "view_file", tpath.split('/')[6])

print(f"Total found matching components: {len(found_contents)}")
for k, (sz, typ, cid) in sorted(found_contents.items()):
    print(f"  [{typ}] {k} ({sz} bytes) in conv {cid[:8]}")
