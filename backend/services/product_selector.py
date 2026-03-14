"""
Stage 2 — Product Selector.
Finds the best product matching category + budget from the static catalog.
In production, replace with PostgreSQL query against the products table.
Personalizes results using purchase history (preferred brands first).
"""
from typing import Optional, List
from models.schemas import ProductResult


# Static product catalog — seed data
# In production: PostgreSQL products table
PRODUCT_CATALOG = [
    # Shoes
    {"name": "Adidas Running Shoes",     "category": "shoes",      "price_paise": 349900, "rating": 4.3, "brand": "Adidas"},
    {"name": "Nike Air Max Lite",         "category": "shoes",      "price_paise": 599900, "rating": 4.5, "brand": "Nike"},
    {"name": "Puma Sports Shoes",         "category": "shoes",      "price_paise": 199900, "rating": 4.0, "brand": "Puma"},
    {"name": "Campus Running Shoes",      "category": "shoes",      "price_paise": 89900,  "rating": 3.9, "brand": "Campus"},
    {"name": "Sparx Sneakers",            "category": "shoes",      "price_paise": 69900,  "rating": 3.7, "brand": "Sparx"},
    # Headphones
    {"name": "Sony WH-CH520",             "category": "headphones", "price_paise": 750000, "rating": 4.3, "brand": "Sony"},
    {"name": "boAt Rockerz 450",          "category": "headphones", "price_paise": 349900, "rating": 4.1, "brand": "boAt"},
    {"name": "JBL Tune 510BT",            "category": "headphones", "price_paise": 299900, "rating": 4.2, "brand": "JBL"},
    {"name": "Zebronics Zeb-Thunder",     "category": "headphones", "price_paise": 149900, "rating": 3.8, "brand": "Zebronics"},
    # Laptops
    {"name": "Dell Inspiron 15",          "category": "laptop",     "price_paise": 4999900,"rating": 4.4, "brand": "Dell"},
    {"name": "Lenovo IdeaPad Slim 3",     "category": "laptop",     "price_paise": 3999900,"rating": 4.3, "brand": "Lenovo"},
    {"name": "HP Pavilion 14",            "category": "laptop",     "price_paise": 4599900,"rating": 4.2, "brand": "HP"},
    # Phones
    {"name": "Redmi 12",                  "category": "phone",      "price_paise": 1299900,"rating": 4.1, "brand": "Xiaomi"},
    {"name": "Samsung Galaxy M34",        "category": "phone",      "price_paise": 1799900,"rating": 4.3, "brand": "Samsung"},
    {"name": "Realme Narzo 60",           "category": "phone",      "price_paise": 1499900,"rating": 4.0, "brand": "Realme"},
]


def select_product(
    product_type: str,
    budget_paise: int,
    preferred_brands: Optional[List[str]] = None,
) -> Optional[ProductResult]:
    """
    Returns best matching product:
    1. Filter by category + budget
    2. Preferred brands first (from purchase history)
    3. Then by rating descending
    Returns None if nothing in budget.
    """
    candidates = [
        p for p in PRODUCT_CATALOG
        if p["category"] == product_type
        and (budget_paise == 0 or p["price_paise"] <= budget_paise)
    ]

    if not candidates:
        return None

    # Sort: preferred brands first, then by rating
    preferred_brands = [b.lower() for b in (preferred_brands or [])]

    def sort_key(p):
        brand_rank = 0
        if p["brand"].lower() in preferred_brands:
            brand_rank = preferred_brands.index(p["brand"].lower())
            return (-10 + brand_rank, -p["rating"])  # preferred brands first
        return (0, -p["rating"])

    candidates.sort(key=sort_key)
    best = candidates[0]

    return ProductResult(
        name=best["name"],
        price=best["price_paise"],
        rating=best["rating"],
        category=best["category"],
    )
