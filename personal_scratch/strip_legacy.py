import re

file_path = r"c:\Users\Bogdan\Desktop\Projects\pypsa-eur\personal_dashboard\visualize_scenarios_ui_v2.py"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# I will use a simple regex to replace the if "LEGACY" in data_format: block and everything inside it up to `return`.
# Since all these blocks end with `return` or they don't?
# Let's check.
# `create_tab_costuri` ends with `            return`
# `create_tab_generare` ends with `            return`
# `create_tab_congestie` ends with `            return`
# `create_tab_pret` ends with `            return`

# Actually, the regex needs to match `        if "LEGACY" in data_format:` up to the first `            return` after it.
pattern = re.compile(r'^[ \t]*if "LEGACY" in data_format:.*?\n(?:[ \t]+.*?\n)*?[ \t]*return\n', re.MULTILINE)

new_content = re.sub(pattern, '', content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)
print("Legacy blocks removed")
