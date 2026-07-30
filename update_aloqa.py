import re

with open('src/components/WelcomeScreen.tsx', 'r') as f:
    content = f.read()

start_tag = r'<section id="aloqa"'
end_tag = r'      <section id="faq"'

start_idx = re.search(start_tag, content).start()
end_idx = re.search(end_tag, content).start()

with open('/tmp/patch_aloqa.tsx', 'r') as f:
    replacement = f.read()

new_content = content[:start_idx] + replacement + content[end_idx:]

with open('src/components/WelcomeScreen.tsx', 'w') as f:
    f.write(new_content)

print("Updated")
