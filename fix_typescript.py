import re

# Read the file
with open(r'd:\D\Ivanta\src\app\admin\dashboard\add-property\page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the section with the input field in the else branch and fix it
# The input is in the else branch, so propertyType can't be "buy" at that point
# We need to change the logic to check if it's required based on the actual type

# Replace in the input field (line ~2108)
content = re.sub(
    r'(<input[^>]*name="beds"[^>]*)\s+required=\{propertyType === "buy" \|\| \(propertyType === "rent" && formData\.rentalCategory === "residential"\) \|\| formData\.subType === "Farm House"\}',
    r'\1 required={(propertyType === "commercial" || propertyType === "pg" || (propertyType === "rent" && formData.rentalCategory !== "residential") || formData.subType === "Farm House")}',
    content,
    flags=re.DOTALL
)

# Also fix the bathrooms input field which likely has the same issue
content = re.sub(
    r'(<input[^>]*name="baths"[^>]*)\s+required=\{propertyType === "buy" \|\| \(propertyType === "rent" && formData\.rentalCategory === "residential"\) \|\| formData\.subType === "Farm House"\}',
    r'\1 required={(propertyType === "commercial" || propertyType === "pg" || (propertyType === "rent" && formData.rentalCategory !== "residential") || formData.subType === "Farm House")}',
    content,
    flags=re.DOTALL
)

# Write back
with open(r'd:\D\Ivanta\src\app\admin\dashboard\add-property\page.tsx', 'w', encoding='utf-8', newline='') as f:
    f.write(content)

print("Fixed!")
