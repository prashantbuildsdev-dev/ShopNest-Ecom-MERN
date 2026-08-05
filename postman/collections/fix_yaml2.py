filepath = r"C:/Users/prash/OneDrive/Desktop/ShopNest-Ecom MERN/postman/collections/postman/collections/ShopNest API/Products/Create product (admin, upload image).request.yaml"

new_content = '$kind: http-request\r\nurl: "{{baseUrl}}/api/product"\r\nmethod: POST\r\nheaders:\r\n  Authorization: Bearer {{token}}\r\nbody:\r\n  type: formdata\r\n  content:\r\n    - type: text\r\n      key: name\r\n      value: Sample Product\r\n    - type: text\r\n      key: description\r\n      value: Product created with an uploaded image\r\n    - type: text\r\n      key: price\r\n      value: "499"\r\n    - type: text\r\n      key: category\r\n      value: Accessories\r\n    - type: text\r\n      key: stock\r\n      value: "20"\r\n    - type: file\r\n      key: image\r\n      src:\r\n        - \'C:/Users/prash/OneDrive/Pictures/image_1.jpg\'\r\norder: 4000\r\n'

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Done!")
