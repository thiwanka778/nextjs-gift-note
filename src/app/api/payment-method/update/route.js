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

       if(!body){
        return NextResponse.json({ message: 'Body missing' }, { status: 400, headers: CORS_HEADERS });
       }

       if(!Array.isArray(body)){
        return NextResponse.json({ message: 'Body must be an array' }, { status: 400, headers: CORS_HEADERS });
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


       for(const payment of body){
          const {id, name, is_verification, service_charge} = payment;
          if(!id){
             continue;
          }

          if(isNaN(Number(id))){
             continue;
          }

          const pm = await prisma.payment_method.findUnique({
            where:{
                id: Number(id),
            }
          });

          if(!pm){
            continue;
          }
          if(pm.shop_identifier !==shop_identifier){
             continue;
          }

          await prisma.payment_method.update({
            where:{
                id: pm.id
            },
            data:{
                name: cleanString(name),
                is_verification: is_verification? is_verification:false,
                service_charge: !isNaN(service_charge)?Number(service_charge):0,
            }
          })
       }


       return NextResponse.json({message: "Payment methods updated successfully"}, {status: 201,
         headers: CORS_HEADERS
       });

    }catch(error){
        console.log('Error updating payment methods:', error);
        return NextResponse.json({ message: 'Payment method update failed', error }, { status: 500,
            headers: CORS_HEADERS
         });
    }

}