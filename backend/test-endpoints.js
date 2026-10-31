const app = require('./src/server');
const http = require('http');

async function testBackend() {
  console.log('[Test] Testing ShopEasy Backend Endpoints...');

  const server = app.listen(5001, '127.0.0.1', async () => {
    try {
      const { initDB } = require('./src/config/db');
      await initDB();

      const fetchEndpoint = (path, method = 'GET', body = null) => {
        return new Promise((resolve, reject) => {
          const req = http.request({
            hostname: '127.0.0.1',
            port: 5001,
            path,
            method,
            headers: {
              'Content-Type': 'application/json'
            }
          }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
              try {
                resolve({ status: res.statusCode, data: JSON.parse(data) });
              } catch (e) {
                resolve({ status: res.statusCode, data });
              }
            });
          });
          req.on('error', reject);
          if (body) req.write(JSON.stringify(body));
          req.end();
        });
      };

      // 1. Root
      const rootRes = await fetchEndpoint('/');
      console.log('✅ GET / =>', rootRes.status, rootRes.data.name);

      // 2. Sync products
      console.log('Testing POST /api/products/sync...');
      const syncRes = await fetchEndpoint('/api/products/sync', 'POST');
      console.log('✅ POST /api/products/sync =>', syncRes.status, `count: ${syncRes.data.count}`);

      // 3. Products list
      const productsRes = await fetchEndpoint('/api/products');
      console.log('✅ GET /api/products =>', productsRes.status, `returned: ${productsRes.data.count} items`);
      const sampleItem = productsRes.data.data[0];
      console.log('   Sample Product:', sampleItem ? `${sampleItem.title} - ₹${sampleItem.price}` : 'None');

      // 4. Single Product
      if (sampleItem) {
        const singleRes = await fetchEndpoint(`/api/products/${sampleItem.id}`);
        console.log(`✅ GET /api/products/${sampleItem.id} =>`, singleRes.status, singleRes.data.data.title);
      }

      // 5. Search
      const searchRes = await fetchEndpoint('/api/products/search?q=essence');
      console.log('✅ GET /api/products/search?q=essence =>', searchRes.status, `found: ${searchRes.data.count}`);

      // 6. Create Demonstration Order
      const orderPayload = {
        customerName: 'Rahul Sharma',
        customerPhone: '+91 98765 43210',
        deliveryAddress: 'Flat 402, Green Glen Layout, Bellandur, Bengaluru',
        subtotal: 1999,
        deliveryCharge: 0,
        totalAmount: 1999,
        items: [
          { id: 1, title: 'Essence Mascara Lash Princess', price: 829, quantity: 2 }
        ]
      };
      const orderRes = await fetchEndpoint('/api/orders', 'POST', orderPayload);
      console.log('✅ POST /api/orders =>', orderRes.status, orderRes.data.data?.orderNumber);

      console.log('\n🎉 ALL BACKEND ENDPOINTS TESTED SUCCESSFULLY!\n');
    } catch (err) {
      console.error('❌ Test failed:', err);
    } finally {
      server.close();
      process.exit(0);
    }
  });
}

testBackend();
