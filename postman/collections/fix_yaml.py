import re

filepath = r"C:/Users/prash/OneDrive/Desktop/ShopNest-Ecom MERN/postman/collections/postman/collections/ShopNest API/Products/Create product (admin, upload image).request.yaml"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the broken backtick-n literal with proper YAML src list
fixed = content.replace(
    "src:`\n        - 'C:/Users/prash/OneDrive/Pictures/image_1.jpg'",
    "src:\n        - 'C:/Users/prash/OneDrive/Pictures/image_1.jpg'"
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(fixed)

print("Fixed!")
print(repr(fixed[fixed.find('- type: file'):fixed.find('order:')]))
