import xml.etree.ElementTree as ET
import json

# Read XML content from a file
file_path = 'ccv_patents.xml'

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
            section_data[label.lower().replace(' ', '_')] = value.text.strip()
        elif lov is not None and lov.text:
            section_data[label.lower().replace(' ', '_')] = lov.text.strip()

    # Extract inventors list and get the first inventor
    inventors_list = section_data.get("inventors", "").split(';')
    first_inventor = inventors_list[0].strip() if inventors_list else ""

    # Create the desired JSON structure
    formatted_data = {
        "type": "patent",
        "key": f"{first_inventor.lower().replace(' ', '')}{section_data.get('filing_date', '').split('-')[0]}patent",
        "title": section_data.get("patent_title", ""),
        "status": section_data.get("patent_status", "").lower(),
        "filed": section_data.get("filing_date", ""),
        "authors": [author.strip() for author in inventors_list],
        "patent_number": section_data.get("patent_number", "")
    }
    
    # Append formatted data to the list
    data.append(formatted_data)

# Convert the list of dictionaries to JSON
json_data = json.dumps(data, indent=2)

# Write JSON data to a file
with open('converted_data.json', 'w') as json_file:
    json_file.write(json_data)