/**
 * Diagnostic Script: Check and Fix Image Paths in Database
 * 
 * This script checks all products in the database for incorrect image paths
 * and can optionally fix them.
 * 
 * Usage:
 *   node scripts/check-image-paths.js          # Check only (dry run)
 *   node scripts/check-image-paths.js --fix    # Check and fix
 */

const mongoose = require('mongoose');
require('dotenv').config();
const path = require('path');
const fs = require('fs');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ Connection error:', err);
    process.exit(1);
  });

// Product Schema (simplified for this script)
const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

async function checkImagePaths(fix = false) {
  try {
    console.log('\n🔍 Checking products in database...\n');
    
    const products = await Product.find({}).exec();
    console.log(`Found ${products.length} products to check\n`);

    if (products.length === 0) {
      console.log('No products found in database.');
      process.exit(0);
    }

    let issuesFound = 0;
    let fixedCount = 0;
    const uploadsBasePath = path.join(process.cwd(), 'uploads');

    for (const product of products) {
      if (!product.productImages || !Array.isArray(product.productImages)) {
        continue;
      }

      let hasIssues = false;
      const fixedImages = [];
      const issues = [];

      product.productImages.forEach((imagePath, index) => {
        // Check for various issues
        if (path.isAbsolute(imagePath)) {
          hasIssues = true;
          issues.push(`  [${index}] Absolute path: ${imagePath}`);
          
          if (fix) {
            const relativePath = path.relative(uploadsBasePath, imagePath);
            const normalized = relativePath.replace(/\\/g, '/');
            fixedImages.push(normalized);
            issues.push(`      → Fixed to: ${normalized}`);
          } else {
            fixedImages.push(imagePath);
          }
        } else if (imagePath.startsWith('/')) {
          hasIssues = true;
          issues.push(`  [${index}] Leading slash: ${imagePath}`);
          
          if (fix) {
            const normalized = imagePath.replace(/^\/+/, '');
            fixedImages.push(normalized);
            issues.push(`      → Fixed to: ${normalized}`);
          } else {
            fixedImages.push(imagePath);
          }
        } else if (imagePath.startsWith('uploads/')) {
          hasIssues = true;
          issues.push(`  [${index}] Includes 'uploads/' prefix: ${imagePath}`);
          
          if (fix) {
            const normalized = imagePath.replace(/^uploads\//, '');
            fixedImages.push(normalized);
            issues.push(`      → Fixed to: ${normalized}`);
          } else {
            fixedImages.push(imagePath);
          }
        } else if (imagePath.includes('\\')) {
          hasIssues = true;
          issues.push(`  [${index}] Contains backslashes: ${imagePath}`);
          
          if (fix) {
            const normalized = imagePath.replace(/\\/g, '/');
            fixedImages.push(normalized);
            issues.push(`      → Fixed to: ${normalized}`);
          } else {
            fixedImages.push(imagePath);
          }
        } else {
          // Path looks correct, but verify file exists
          const fullPath = path.join(uploadsBasePath, imagePath);
          if (!fs.existsSync(fullPath)) {
            hasIssues = true;
            issues.push(`  [${index}] File not found: ${imagePath}`);
            issues.push(`      Expected at: ${fullPath}`);
          }
          fixedImages.push(imagePath);
        }
      });

      if (hasIssues) {
        issuesFound++;
        console.log(`\n⚠️  Product: ${product.productName || product._id}`);
        console.log(`   ID: ${product._id}`);
        issues.forEach(issue => console.log(issue));

        if (fix) {
          product.productImages = fixedImages;
          await product.save();
          fixedCount++;
          console.log(`   ✅ Fixed and saved`);
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`📊 Summary:`);
    console.log(`   Total products: ${products.length}`);
    console.log(`   Products with issues: ${issuesFound}`);
    
    if (fix) {
      console.log(`   Products fixed: ${fixedCount}`);
      console.log(`\n✅ Database has been updated!`);
    } else {
      console.log(`\n💡 Run with --fix flag to automatically fix issues:`);
      console.log(`   node scripts/check-image-paths.js --fix`);
    }
    
    console.log('='.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Check command line arguments
const shouldFix = process.argv.includes('--fix');

checkImagePaths(shouldFix);
