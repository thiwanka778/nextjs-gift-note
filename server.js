const { createServer } = require('http');
const axios = require('axios');
const { parse } = require('url');
const next = require('next');


const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();


app.prepare().then(() => {
    createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    }).listen(3000, async (err) => {
        if (err) throw err;
        console.log('> Ready on http://localhost:3000');
        fetchWebhookSubscriptions();
        
    });
});



const credentials =[{shopName:process.env.TEST_SHOPIFY_SHOP_NAME,accessToken:process.env.TEST_SHOPIFY_ACCESS_TOKEN}]



const fetchWebhookSubscriptions = async () => {
   for(const credential of credentials){
    const webhookSubscriptions = await getWebhookSubscriptions(credential.shopName,credential.accessToken);
    if(webhookSubscriptions && Array.isArray(webhookSubscriptions)){
        checkWebhookSubscriptions(webhookSubscriptions,credential.shopName,credential.accessToken)
    }else{
        console.log("❌ Webhook Subscriptions not found");
    }
   }
}


const checkWebhookSubscriptions = async (webhookSubscriptions,shopifyStoreUrl,accessToken) => {
    const findObject = webhookSubscriptions.find((item)=>item?.node?.topic === "ORDERS_CREATE");
    if(findObject){
        console.log("✅ Already subscribed to ORDERS_CREATE for ",shopifyStoreUrl);
    }else{
        const response = await createWebhookSubscription(shopifyStoreUrl,accessToken);
        if(response){
            console.log("✅ ORDERS_CREATE Webhook Subscription created successfully for ",shopifyStoreUrl);
        }else{
            console.log("❌ ORDERS_CREATE Webhook Subscription creation failed");
        }
    }
}



async function getWebhookSubscriptions(shopifyStoreUrl, accessToken) {

    const maxRetries = 5;
    const retryDelay = 2000;
    let attempts = 0;


    while(attempts < maxRetries){

        try {
            const url = `https://${shopifyStoreUrl}/admin/api/2025-01/graphql.json`;
        
            const headers = {
              "Content-Type": "application/json",
              "X-Shopify-Access-Token": accessToken,
            };
        
            const data = {
              query: `
                query WebhookSubscriptionList {
                  webhookSubscriptions(first: 250) {
                    edges {
                      node {
                        id
                        topic
                      }
                    }
                  }
                }
              `,
            };
        
            const response = await axios.post(url, data, { headers });
            if(Array.isArray(response?.data?.data?.webhookSubscriptions?.edges)){
              return response.data.data.webhookSubscriptions.edges
            }else{
                console.log("❌ Retrying...")
            }
           
            
          } catch (error) {
             console.error("❌ Error fetching webhook subscriptions:", error);
          }

          attempts++;
          console.log(`${attempts} attempts of ${maxRetries}`)
          await new Promise(resolve => setTimeout(resolve, retryDelay));

    }

    return null;
    
    
  }


  async function createWebhookSubscription(shopifyStoreUrl, accessToken) {
     const callbackUrl = `${process.env.NEXTJS_BACKEND_DEPLOYED_URL}/api/v1/receive/order-details/webhooks/giftnote-backend`
    const maxRetries = 5;
    const retryDelay = 2000;
    let attempts = 0;


    while(attempts<maxRetries){

        try {
            const url = `https://${shopifyStoreUrl}/admin/api/2025-01/graphql.json`;
        
            const headers = {
              "Content-Type": "application/json",
              "X-Shopify-Access-Token": accessToken,
            };
        
            const data = {
              query: `
                mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
                  webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
                    webhookSubscription {
                      id
                      topic
                      format
                    
                    }
                    userErrors { field message }
                  }
                }
              `,
              variables: {
                topic: "ORDERS_CREATE",
                webhookSubscription: {
                  callbackUrl,
                  format: "JSON",
                },
              },
            };
        
            const response = await axios.post(url, data, { headers });
        
            if(response?.data?.data?.webhookSubscriptionCreate?.webhookSubscription?.id ){
                 return response.data.data.webhookSubscriptionCreate.webhookSubscription
            }else{
              console.log("Retrying...")
            }
             
        
          } catch (error) {
            console.error("❌ Error creating webhook subscription:", error);
           
          }

          attempts++;
          console.log(`${attempts} attempts of ${maxRetries}`)
          await new Promise(resolve => setTimeout(resolve, retryDelay));

    }

    return null;
   
   
  }