const https = require('https');

exports.handler = async function(event, context) {
  // Configurație Mailchimp
  const API_KEY = process.env.MAILCHIMP_API_KEY;
  const LIST_ID = 'a0dfd9b96f';
  const SERVER_PREFIX = 'us22';
  
  const options = {
    hostname: `${SERVER_PREFIX}.api.mailchimp.com`,
    path: `/3.0/lists/${LIST_ID}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${API_KEY}`
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          const count = response.stats.member_count;
          
          resolve({
            statusCode: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ count: count })
          });
        } catch (e) {
          resolve({
            statusCode: 500,
            body: JSON.stringify({ error: 'Error parsing response' })
          });
        }
      });
    });
    
    req.on('error', (e) => {
      resolve({
        statusCode: 500,
        body: JSON.stringify({ error: e.message })
      });
    });
    
    req.end();
  });
};
