const https = require('https');

exports.handler = async function(event, context) {
  const API_KEY = process.env.MAILCHIMP_API_KEY;
  const LIST_ID = 'a0dfd9b96f';
  const SERVER_PREFIX = 'us22';
  
  // Verifică dacă API Key există
  if (!API_KEY) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'API Key not configured' })
    };
  }
  
  const options = {
    hostname: `${SERVER_PREFIX}.api.mailchimp.com`,
    path: `/3.0/lists/${LIST_ID}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'User-Agent': 'Netlify-Function'
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Response:', data);
        
        try {
          const response = JSON.parse(data);
          
          // Verifică dacă e eroare de la Mailchimp
          if (response.status === 'error' || response.status >= 400) {
            console.error('Mailchimp error:', response);
            return resolve({
              statusCode: 500,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ 
                error: 'Mailchimp API error',
                details: response.title || response.detail || 'Unknown error'
              })
            });
          }
          
          const count = response.stats ? response.stats.member_count : 0;
          
          resolve({
            statusCode: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ count: count })
          });
        } catch (e) {
          console.error('Parse error:', e);
          console.error('Raw data:', data);
          resolve({
            statusCode: 500,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
              error: 'Error parsing response',
              message: e.message,
              raw: data.substring(0, 200)
            })
          });
        }
      });
    });
    
    req.on('error', (e) => {
      console.error('Request error:', e);
      resolve({
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: 'Request failed',
          message: e.message 
        })
      });
    });
    
    req.end();
  });
};
