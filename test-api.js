const axios = require('axios');

const APIs = [
  {
    name: "Nexadev API",
    url: "https://api.nexadev.my.id/api/aio",
    params: { url: "https://vt.tiktok.com/ZS2x9a9d" }
  },
  {
    name: "Tikwm API",
    url: "https://www.tikwm.com/api/",
    data: "url=https://vt.tiktok.com/ZS2x9a9d",
    method: "POST"
  },
  {
    name: "SnapTik Alternative",
    url: "https://snaptik.app/abc.php",
    data: { url: "https://vt.tiktok.com/ZS2x9a9d", lang: "en", token: "" },
    method: "POST"
  }
];

async function testAPI(api) {
  console.log(`\n🔄 Testing: ${api.name}`);
  console.log(`   URL: ${api.url}`);
  
  try {
    let response;
    if (api.method === "POST") {
      response = await axios.post(api.url, api.data, {
        timeout: 15000,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Content-Type": api.data && typeof api.data === "string" 
            ? "application/x-www-form-urlencoded" 
            : "application/json"
        }
      });
    } else {
      response = await axios.get(api.url, {
        params: api.params,
        timeout: 15000,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      });
    }
    
    console.log(`✅ SUCCESS!`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Data Type: ${typeof response.data}`);
    if (response.data) {
      const preview = JSON.stringify(response.data, null, 2).substring(0, 500);
      console.log(`   Data Preview:\n${preview}${preview.length >= 500 ? '...' : ''}`);
    }
    return { success: true, api: api.name, data: response.data };
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Error: ${JSON.stringify(error.response.data).substring(0, 200)}`);
    }
    return { success: false, api: api.name, error: error.message };
  }
}

async function runTests() {
  console.log("=================================");
  console.log("  API TESTING SUITE");
  console.log("=================================");
  
  const results = [];
  for (const api of APIs) {
    const result = await testAPI(api);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s between tests
  }
  
  console.log("\n=================================");
  console.log("  SUMMARY");
  console.log("=================================");
  results.forEach(r => {
    console.log(`${r.success ? '✅' : '❌'} ${r.api}: ${r.success ? 'WORKING' : r.error}`);
  });
  
  const workingAPI = results.find(r => r.success);
  if (workingAPI) {
    console.log(`\n🎉 Recommended API: ${workingAPI.api}`);
  } else {
    console.log(`\n⚠️  No working API found. All APIs failed.`);
  }
}

runTests().catch(console.error);
