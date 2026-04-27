import os
import re

vault_dir = r"c:\Users\Bogdan\Desktop\Projects\pypsa-eur\vault"

for root, _, files in os.walk(vault_dir):
    for f in files:
        if not f.endswith(".md"): continue
        path = os.path.join(root, f)
        with open(path, "r", encoding="utf-8") as file:
            content = file.read()
            
        # 1. Replace exact 'visualize_scenarios_ui.py' with 'visualize_scenarios_ui_v2.py'
        # but only if it is not already followed by '_v2.py'
        content = re.sub(r'visualize_scenarios_ui\.py(?!\w)', 'visualize_scenarios_ui_v2.py', content)
        
        # 2. Clean up some specific v1 vs v2 redundancy if possible.
        # Just simple replacements for common phrases
        content = content.replace("v2 - Current Version", "Current Version")
        content = content.replace("visualize_scenarios_ui_v2.py (Versiunea 1)", "Eliminated Version")
        content = content.replace("visualize_scenarios_ui_v2_v2", "visualize_scenarios_ui_v2")
        
        with open(path, "w", encoding="utf-8") as file:
            file.write(content)
