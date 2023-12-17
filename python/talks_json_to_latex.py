import json

# Read JSON content from a file
file_path = 'ccv_talks.json'

# Read JSON data from file
with open(file_path, 'r') as json_file:
    data = json.load(json_file)

# Iterate through each entry in the JSON data
for entry in data:
  template = """\\item \\ressubheading{event}{location}{title}{year}"""
  template = template.replace("event", entry['event'])
  template = template.replace("location", entry['location'])
  template = template.replace("title", entry['title'])
  template = template.replace("year", entry['year'])
  print(template)