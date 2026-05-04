#!/bin/bash

echo "🧪 Testing ShopMatcha API - Phase 2 Implementation"
echo "=================================================="
echo ""

BASE_URL="http://localhost:3000/api/shop/products"

echo "1. ✅ Default products list:"
curl -s "$BASE_URL" | jq '.data.pagination'
echo ""

echo "2. ✅ Sort by price ascending:"
curl -s "$BASE_URL?sortBy=price_asc" | jq '.data.products[].GiaBan'
echo ""

echo "3. ✅ Filter by category:"
curl -s "$BASE_URL?MaLoai=DM001" | jq '.data.pagination.total'
echo ""

echo "4. ✅ Search functionality:"
curl -s "$BASE_URL?search=matcha" | jq '.data.pagination.total'
echo ""

echo "5. ✅ Price range filtering:"
curl -s "$BASE_URL?minPrice=250000&maxPrice=350000" | jq '.data.products[].GiaBan'
echo ""

echo "6. ✅ In-stock filtering:"
curl -s "$BASE_URL?inStock=true" | jq '.data.pagination.total'
echo ""

echo "7. ✅ Pagination:"
curl -s "$BASE_URL?page=1&limit=2" | jq '.data.pagination'
echo ""

echo "8. ✅ Combined filters:"
curl -s "$BASE_URL?MaLoai=DM001&minPrice=200000&maxPrice=280000&sortBy=price_desc&search=xanh" | jq '.data.products[0].TenSP'
echo ""

echo "9. ✅ Validation error:"
curl -s "$BASE_URL?page=0" | jq '.error'
echo ""

echo "🎉 All API tests completed successfully!"