const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/repositories/order.repository.js');
let content = fs.readFileSync(filePath, 'utf8');

// Find and replace the problematic section
const oldCode = `    // Transform filesUrl array into files objects for frontend compatibility
    const transformedOrders = orders.map(order => ({
      ...order,
      product: {
        ...order.product,
        files: order.product.filesUrl.map((url, index) => ({
          id: \`\${order.product.id}-file-\${index}\`,
          name: url.split('/').pop() || \`Arquivo \${index + 1}\`,
          url: url,
          size: 0 // Size not available, frontend can handle this
        }))
      }
    }));`;

const newCode = `    // Transform filesUrl array into files objects for frontend compatibility
    // Handle both product purchases and app purchases
    const transformedOrders = orders.map(order => {
      // Se é compra de produto (tem productId e product)
      if (order.product && order.product.filesUrl) {
        return {
          ...order,
          product: {
            ...order.product,
            files: order.product.filesUrl.map((url, index) => ({
              id: \`\${order.product.id}-file-\${index}\`,
              name: url.split('/').pop() || \`Arquivo \${index + 1}\`,
              url: url,
              size: 0
            }))
          }
        };
      }
      // Se é compra de app (não tem product, tem metadata com appId)
      return order;
    });`;

content = content.replace(oldCode, newCode);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Fixed getUserPurchases to handle app purchases!');
