import xml.etree.ElementTree as ET
import json

# Read XML content from a file
file_path = 'ccv_talks.xml'

# Parse the XML content
tree = ET.parse(file_path)
root = tree.getroot()

# Create a list to hold the converted data
data = []

# Iterate through each 'section' in the XML
for section in root.findall('section'):
    section_data = {}
    
    # Get values from the fields within each section
    for field in section.findall('field'):
        label = field.get('label')
        value = field.find('value')
        lov = field.find('lov')
        if value is not None and value.text:
            section_data[label.lower()] = value.text
        elif lov is not None and lov.text == 'Yes':
            section_data[label.lower()] = 'Yes'

    # if "keynote?" in section_data:
    #     print(section_data.get("keynote?", "").lower())

    # Create the desired JSON structure
    formatted_data = {
        "title": section_data.get("presentation title", ""),
        "event": section_data.get("conference / event name", ""),
        "location": f"{section_data.get('city', '')} ({section_data.get('location', '')})",
        "year": section_data.get("presentation year", ""),
        "keynote": section_data.get("keynote?", "").lower() if "keynote?" in section_data else "no"
    }
    
    # Append formatted data to the list
    data.append(formatted_data)

# Convert the list of dictionaries to JSON
json_data = json.dumps(data, indent=2)

# Write JSON data to a file
with open('ccv_talks.json', 'w') as json_file:
    json_file.write(json_data)
