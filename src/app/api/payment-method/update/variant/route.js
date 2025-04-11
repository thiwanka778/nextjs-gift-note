import { NextResponse } from 'next/server';
import  prisma from "../../../../../../lib/prisma";
import { validateGatewayRequest } from '../../../../../../lib/validateRequest';
import valid_stores from '@/config/valid_stores';


const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*', // Allow all origins
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Headers': '*',
  };

  function cleanString(input) {
    return input.trim().replace(/\s+/g, ' ');
  }
  
  

export async function POST(req){
    try{

       const body = await req.json();
       const {id,shopify_product_id,shopify_variant_id,shopify_inventory_item_id} = body;

       if(!id){
         return NextResponse.json({ message: 'ID missing' }, { status: 400, headers: CORS_HEADERS });
       }



       const {searchParams}= new URL(req.url);
       const sessionToken = searchParams.get('x-shopify-session-token');
       const shop_identifier = searchParams.get("shop_identifier");

       if(!sessionToken){
        return NextResponse.json({ message: 'Session token missing' }, { status: 400, headers: CORS_HEADERS });
       }
       
       if(!shop_identifier){
        return NextResponse.json({ message: 'Shop identifier missing' }, { status: 400, headers: CORS_HEADERS });
       }

       if(!valid_stores.includes(shop_identifier)){
        return NextResponse.json({ message: 'Invalid shop identifier' }, { status: 400, headers: CORS_HEADERS });
       }


       const validation = await validateGatewayRequest(sessionToken,shop_identifier);
       if(!validation.isValid){
         return validation.response;
       }

       const pm = await prisma.payment_method.findUnique({
         where:{
            id: Number(id)
         }
       });

       if(!pm){
         return NextResponse.json({ message: 'Payment method not found' }, { status: 404, headers: CORS_HEADERS });
       }

       if(pm.shop_identifier !== shop_identifier){
        return NextResponse.json({ message: 'Payment method not found' }, { status: 404, headers: CORS_HEADERS });
       }

       async function updateIfMissing(field, value) {
        if ((!pm[field] || pm[field].trim() === '') && value && value.trim() !== '') {
          await prisma.payment_method.update({
            where: { id: pm.id },
            data: { [field]: value }
          });
        }
      }

        
      await updateIfMissing('shopify_product_id', shopify_product_id);
      await updateIfMissing('shopify_variant_id', shopify_variant_id);
      await updateIfMissing('shopify_inventory_item_id', shopify_inventory_item_id);
     

       return NextResponse.json({message: "success"}, {status: 200,
         headers: CORS_HEADERS
       });

    }catch(error){
        console.log('Error creating payment method:', error);
        return NextResponse.json({ message: 'Payment method creation failed', error }, { status: 500,
            headers: CORS_HEADERS
         });
    }

}


