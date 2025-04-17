import { NextResponse } from 'next/server';
import  prisma from "../../../../lib/prisma";
import { decryptAES } from '../../../../lib/decrypt';
import { validateGatewayRequestExtension } from '../../../../lib/validateCheckoutToken';
import axios from 'axios';
import valid_stores from '@/config/valid_stores';


const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*', // Allow all origins
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Headers': '*',
  };

  function cleanString(input) {
    return input.trim().replace(/\s+/g, ' ');
  }
  
  const SECRET_KEY = process.env.SECRET_KEY;
  

export async function POST(req){

    try{

       const {searchParams}= new URL(req.url);
       const sessionToken = searchParams.get('x-shopify-session-token');
       const shop_identifier = searchParams.get("shop_identifier");
       const customer_id = searchParams.get("customer_id");
       const country = searchParams.get("country");
       

       console.log("SHOP IDENTIFIER",shop_identifier);


       if(!country || country.trim()===""){
        return NextResponse.json({ message: 'Country missing' }, { status: 400, headers: CORS_HEADERS });
       }


       if(!customer_id || customer_id.trim()===""){
        return NextResponse.json({ message: 'Customer ID missing' }, { status: 400, headers: CORS_HEADERS });
       }

       if(!sessionToken){
        return NextResponse.json({ message: 'Session token missing' }, { status: 400, headers: CORS_HEADERS });
       }
       
       if(!shop_identifier){
        return NextResponse.json({ message: 'Shop identifier missing' }, { status: 400, headers: CORS_HEADERS });
       }

       if(!valid_stores.includes(shop_identifier)){
        return NextResponse.json({ message: 'Invalid shop identifier' }, { status: 400, headers: CORS_HEADERS });
       }


       const validation = await validateGatewayRequestExtension(sessionToken,shop_identifier);
       if(!validation.isValid){
         return validation.response;
       }

       const credential  = await prisma.credential.findUnique({
         where:{
            shop_identifier: shop_identifier
         }
       });


       if(!credential){
        return NextResponse.json({ message: 'Invalid shop identifier' }, { status: 400, headers: CORS_HEADERS });
       }


       const accessToken = await decryptAES(credential.access_token,SECRET_KEY);

       if(!accessToken || accessToken.trim()===""){
        return NextResponse.json({ message: 'Invalid access token' }, { status: 400, headers: CORS_HEADERS });
       }

       const shopifyStoreUrl = `https://${shop_identifier}/admin/api/2025-01/graphql.json`;

       const countryTag = returnCountry(String(country));

       const tags = await fetchCustomerDetails(customer_id,shopifyStoreUrl,accessToken);

       if(!Array.isArray(tags)){
         return NextResponse.json({ message: 'Invalid tags' }, { status: 400, headers: CORS_HEADERS });
       }

       const filteredTags = tags.filter(tag => tag !== "LOCAL" && tag !== "EXPAT");

       await updateCustomerMetafields(shopifyStoreUrl,accessToken,customer_id,filteredTags.push(countryTag));

       return NextResponse.json({message: "Customer tags updated successfully"}, {status: 200,
         headers: CORS_HEADERS
       });

    }catch(error){
        console.log('Error updating customer tags:', error);
        return NextResponse.json({ message: 'Customer tags update failed', error }, { status: 500,
            headers: CORS_HEADERS
         });
    }

}



const updateCustomerMetafields = async (shopifyStoreUrl,accessToken, customerId, tags) => {

    const maxRetries = 3;
    const retryDelay = 1000;
    let attempts = 0;
  
    const mutation = `
      mutation updateCustomerMetafields($input: CustomerInput!) {
        customerUpdate(input: $input) {
          customer {
            id
            metafields(first: 3) {
              edges {
                node {
                  id
                  namespace
                  key
                  value
                }
              }
            }
          }
          userErrors {
            message
            field
          }
        }
      }
    `;
  
    const variables = {
      input: {
        tags,
        id: customerId
      }
    };

    while(attempts<maxRetries){

        try {
            const response = await axios.post(
              shopifyStoreUrl,
              {
                query: mutation,
                variables: variables,
              },
              {
                headers: {
                  'X-Shopify-Access-Token': accessToken,
                  'Content-Type': 'application/json',
                },
              }
            );
      
            if(response?.data?.data?.customerUpdate?.customer?.id){
               return response.data.data.customerUpdate.customer.id;
            }
        
           
          } catch (error) {
            console.error('Error updating metafields:', error);
          }

          attempts++;
          await new Promise(resolve => setTimeout(resolve, retryDelay));

    }

    return null;
  
  
  };


const returnCountry=(country)=>{

    const value = country.toString().toLowerCase().trim();

    if(value==="lk" || value==="sri lanka" || value==="srilanka" || value==="sri-lanka" || value==="lkr"){
        return "LOCAL";
    }else{
        return "EXPAT";
    }

}

const fetchCustomerDetails = async (customerId,shopifyStoreUrl,accessToken) => {
   
    const maxRetries = 3;
    const retryDelay = 1000;
    let attempts = 0;
  
    const query = `
      query {
        customer(id: "gid://shopify/Customer/${customerId}") {
          id
          firstName
          lastName
          email
          tags
         
        }
      }
    `;

    while(attempts<maxRetries){

        try {
            const response = await axios.post(
              shopifyStoreUrl,
              { query },
              {
                headers: {
                  'X-Shopify-Access-Token': accessToken,
                  'Content-Type': 'application/json',
                },
              }
            );
            if(response?.data?.data?.customer?.id){
               return response.data.data.customer.tags;
            }
          } catch (error) {
            console.error('Error fetching customer details:', error);
          }

          attempts++;
          await new Promise(resolve => setTimeout(resolve, retryDelay));

    }

    return null;

  };