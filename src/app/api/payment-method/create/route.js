import { NextResponse } from 'next/server';
import  prisma from "../../../../../lib/prisma";
import { validateGatewayRequest } from '../../../../../lib/validateRequest';
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
       const {name, is_verification,service_charge} = body;

       if(!name || name.trim()===""){
        return NextResponse.json({ message: 'Name missing' }, { status: 400, headers: CORS_HEADERS });
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

       const savedPaymentMethod = await prisma.payment_method.create({
         data:{
            shop_identifier: shop_identifier,
            name: cleanString(name),
            service_charge: !isNaN(service_charge)?Number(service_charge):0,
            is_verification: is_verification? is_verification:false,
         }
       })

       return NextResponse.json({message: "Payment method created successfully", ...savedPaymentMethod}, {status: 201,
         headers: CORS_HEADERS
       });

    }catch(error){
        console.log('Error creating payment method:', error);
        return NextResponse.json({ message: 'Payment method creation failed', error }, { status: 500,
            headers: CORS_HEADERS
         });
    }

}