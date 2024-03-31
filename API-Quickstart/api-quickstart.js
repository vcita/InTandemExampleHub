// step 1 add directory token to the header
const https = require('https');

function prepareRequestOptions(path, authToken, method = 'POST') {
  const hostname = 'api.vcita.biz'; 
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`,
  };
  return {
    hostname,
    port: 443,
    path,
    method,
    headers,
  };
}
const path = '/platform/v1/businesses';
const authToken = 'your_directory_token_here';

// Prepare request options using the utility function
const options = prepareRequestOptions(path, authToken);
let businessUid =  null;
// step 2 create a business account

// Define your payload here 
  
  function createBusiness(options, data, callback) {
    // Stringify the data for the HTTP request body
    const stringifiedData = JSON.stringify(data);
  
    // Ensure Content-Length is set correctly for the stringified data
    options.headers['Content-Length'] = Buffer.byteLength(stringifiedData);
  
    // Create the HTTPS request
    const req = https.request(options, (res) => {
      let rawData = '';
  
      // Accumulate data chunks received from the response
      res.on('data', (chunk) => {
        rawData += chunk;
      });
  
      // Handle the end of the response
      res.on('end', () => {
        try {
          // Parse the raw data collected from the response
          const parsedData = JSON.parse(rawData);
          // Extract the business ID from the parsed response data
          const buid = parsedData.data.business.id;
          // Invoke the callback with null error and the business ID
          callback(null, buid);
        } catch (error) {
          // If parsing fails, invoke the callback with the error
          callback(error, null);
        }
      });
    });
  
    // Handle request errors (e.g., network issues)
    req.on('error', (error) => {
      // Invoke the callback with the encountered error
      callback(error, null);
    });
  
    // Write the stringified data to the request body
    req.write(stringifiedData);
    // End the request, sending it off
    req.end();
  }
  // create an admin user object
  const admin={  
    "country_name": "United States",  
    "display_name": "DName",  
    "email": "[adminemail@email.com](mailto:adminemail@email.com)",  
    "first_name": "FName",  
    "language": "en",  
    "last_name": "LName",  
    "phone": "+154863488",  
    "user_id": "11111"  
  };
  // create a business object
  const business={  
    "business_category": "aeroclub",  
    "business_maturity_in_years": "0.5",  
    "country_name": "United States",  
    "id": "1a123b456c789",  
    "landing_page": "Homepage",  
    "name": "Business name",  
    "short_description": "My business description"  
  };
  // create a business meta object
const businessMeta={  
    "auth_token": "a1a1a1a1a1",  
    "external_reference_id": "1213444", 
    "in_setup": "true",  
    "intents": [  
      "accept_payments_tile",  
      "documents_and_forms"  
    ],  
    "is_template": "false"
  };
  // Step 2: Create the business account
  
  const data = JSON.stringify({  
    "admin_account": admin,  
    "business": business,
    "meta": businessMeta
  });
// Create the business account
createBusiness(options, data, (error, buid) => {
    if (error) {
      console.error("Error creating business account:", error);
      return;
    }
  
    console.log("Successfully created business account. Business UID:", buid);
  
    // You can use the business ID for further operations like creating a subscription for this business:
     businessUid=buid;
     const purchasablePriceUid='a_purchasable_price_uid'
     createBusinessSubscription(businessUid,purchasablePriceUid,authToken,(error, subuid)=> {
        if (error) {
          console.error("Error creating subscription:", error);
          return;
            }
  
            console.log("Successfully created subscription. Subscription UID:", subuid);
     });
  });
  
// step 3: create a subscription
  function createBusinessSubscription(businessUid, purchasablePriceUid, authToken, callback) {
    // Define the request body data
    const data = JSON.stringify({
      "business_uid": businessUid,
      "subscription": {
        "purchasable_price_uid": purchasablePriceUid
      }
    });
  
    // Prepare the request options using the utility function
    const options = prepareRequestOptions('/business/subscriptionsmng/v1/subscriptions', authToken, 'POST');
    // Ensure the 'Content-Length' header is correctly set
    options.headers['Content-Length'] = Buffer.byteLength(data);
  
    // Create and send the HTTPS request
    const req = https.request(options, (res) => {
      let rawData = '';
  
      // Collect response data
      res.on('data', (chunk) => rawData += chunk);
  
      // Process the response once fully received
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(rawData);
          callback(null, parsedData); // Invoke callback with the parsed response data
        } catch (error) {
          callback(error, null); // Handle parsing errors
        }
      });
    });
  
    req.on('error', (error) => callback(error, null)); // Handle request errors
  
    // Write the request body and close the request
    req.write(data);
    req.end();
  }

  // step 4: get a business token

  function getBusinessToken(authToken, callback) {
    // Use the utility function to prepare request options
    const options = prepareRequestOptions('/platform/v1/tokens', authToken, 'GET');
  
    // Make the HTTPS request with the dynamically prepared options
    const req = https.request(options, (res) => {
      let rawData = '';
  
      res.on('data', (chunk) => {
        rawData += chunk;
      });
  
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(rawData);
          if (parsedData.status === 'OK' && parsedData.data.tokens.length > 0) {
            const token = parsedData.data.tokens[0].token; // Assuming you want the first token
            callback(null, token);
          } else {
            callback(new Error('No tokens found or bad response'), null);
          }
        } catch (e) {
          callback(e, null);
        }
      });
    });
  
    req.on('error', (e) => {
      callback(e, null);
    });
  }
  getBusinessToken(authToken, (error, token) => {
    if (error) {
      console.error('Failed to get business token:', error);
      return;
    }
    console.log('Retrieved Business Token:', token);
    const businessToken=token

    // step 5: add staff using a the recieved business token
    const path='platform/v1/businesses/'+businessUid +'/staffs';
    const options = prepareRequestOptions(path, businessToken, 'POST');
    const staffArray = JSON.stringify([
        {
          "active": "true",
          "deleted": "false",
          "display_name": "My Display Name",
          "email": "my.email@domain.com",
          "first_name": "First Name",
          "id": "somerandomuniqueid",
          "invite_sent": "2015-10-23 13:02:09",
          "last_name": "Last Name",
          "mobile_number": "0500000001",
          "photo": "https://c15101458.ssl.cf2.rackcdn.com/avatar/image/46/cay8ek2xzufnr39cbrc0nebw1tmy4v2z.png",
          "professional_title": "My Professional Title",
          "role": "user"
        }
      ]);
    createStaff(options,(error, staff) => {
        if (error) {
          console.error('Failed to create staff:', error);
          return;
        }
        console.log('Staff Created:', staff);
      });
    
  });

  function createStaff(options, callback) {
    // Use the utility function to prepare request options
  
    // Make the HTTPS request with the dynamically prepared options
    const req = https.request(options, (res) => {
      let rawData = '';
  
      res.on('data', (chunk) => {
        rawData += chunk;
      });
  
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(rawData);
          if (parsedData.status === 'OK' && parsedData.data.tokens.length > 0) {
            const staff = parsedData.data.staff[0]; // Assuming you want the first token
            callback(null, staff);
          } else {
            callback(new Error('No tokens found or bad response'), null);
          }
        } catch (e) {
          callback(e, null);
        }
      });
    });
  
    req.on('error', (e) => {
      callback(e, null);
    });
  }
