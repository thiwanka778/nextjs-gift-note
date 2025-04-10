import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { validateGatewayRequest } from '../../../../lib/validateRequest';
import valid_stores from '@/config/valid_stores';


const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*', // Allow all origins
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Headers': '*',
  };

  function cleanAndUppercase(str) {
    return str.trim().replace(/\s+/g, ' ').toUpperCase();
  }
  

export async function POST(req){

        // Set CORS headers

    try{

       const body = await req.json();
       const {shop_identifier,name,is_default} = body;

       const {searchParams}= new URL(req.url);
       const sessionToken = searchParams.get('x-shopify-session-token');

       if(!sessionToken){
        return NextResponse.json({ message: 'Session token missing' }, { status: 400, headers: CORS_HEADERS });
       }
       
       

       if(!name || name.trim()===""){
        return NextResponse.json({ message: 'Name missing' }, { status: 400, headers: CORS_HEADERS });
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

       const cleanName = cleanAndUppercase(String(name));

        const settings = await prisma.message_gateway.findFirst({
            where:{
                shop_identifier: shop_identifier,
                name: cleanName,
               
            }
        });

        if(settings){


            const updatedSettings = await prisma.message_gateway.update({
                where:{
                    id: settings.id
                },
                data:{
                    is_default: is_default
                }
            })



            return NextResponse.json({ message: 'Message gateway updated successfully' , data: updatedSettings }, { status: 200, headers: CORS_HEADERS });
        }

        const savedSettings = await prisma.message_gateway.create({
            data:{
                shop_identifier: shop_identifier,
                name: cleanName,
                is_default: is_default 
            }
        });

       return NextResponse.json({message: "Settings saved successfully", data: savedSettings}, {status: 201,
         headers: CORS_HEADERS
       });

    }catch(error){
        console.log('Error uploading file:', error);
        return NextResponse.json({ message: 'Settings save failed', error }, { status: 500,
            headers: CORS_HEADERS
         });
    }
}