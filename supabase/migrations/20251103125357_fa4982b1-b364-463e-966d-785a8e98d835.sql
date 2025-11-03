-- Add category_type to categories and backfill
ALTER TABLE categories ADD COLUMN IF NOT EXISTS category_type text;
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(category_type);

-- Backfill based on existing color coding
UPDATE categories SET category_type = 'income' WHERE color ILIKE '%10b981%' OR slug IN ('salary','freelance-income','business-income','investment-returns','rental-income','dividend-income','interest-income','bonus','commission','refunds','gifts-received','pension','side-hustle','crypto-gains','stock-gains','royalties','consulting','teaching','grants','other-income');
UPDATE categories SET category_type = 'savings' WHERE color ILIKE '%3b82f6%' OR slug IN ('emergency-fund','retirement','investment-savings','education-fund','vacation-fund','home-fund','car-fund','wedding-fund','medical-fund','child-education','fixed-deposit','mutual-funds','stock-savings','crypto-savings','gold-investment','ppf-epf','recurring-deposit','insurance-premium','general-savings','other-savings');
UPDATE categories SET category_type = 'expense' WHERE category_type IS NULL;
