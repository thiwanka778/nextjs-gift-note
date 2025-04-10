import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import valid_stores from '@/config/valid_stores';


const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*', // Allow all origins
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Headers': '*',
  };

  

export async function PUT(req){

        // Set CORS headers

    try{

       const body = await req.json();
        
       if(!body){
        return NextResponse.json({ message: 'Body missing' }, { status: 400, headers: CORS_HEADERS });
       }

       if(!Array.isArray(body)){
        return NextResponse.json({ message: 'Body must be an array' }, { status: 400, headers: CORS_HEADERS });
       }

       if(body.length === 0){
        return NextResponse.json({ message: 'Body must not be empty' }, { status: 200, headers: CORS_HEADERS });
       }
       
       
       const { searchParams } = new URL(req.url);
       const shop_identifier = searchParams.get('shop_identifier');

       

       if(!shop_identifier){
        return NextResponse.json({ message: 'Shop identifier missing' }, { status: 400, headers: CORS_HEADERS });
       }

       if(!valid_stores.includes(shop_identifier)){
        return NextResponse.json({ message: 'Invalid shop identifier' }, { status: 400, headers: CORS_HEADERS });
       }


       for(const item of body){
           const {id,is_default} = item;
           const settings = await prisma.message_gateway.findUnique({
             where:{
                id: parseInt(id,10),
             }
           });

           if(settings){
             await prisma.message_gateway.update({
                 where:{
                    id: settings.id
                 },
                 data:{
                    is_default: is_default
                 }
             })
           }
       }


        

       return NextResponse.json({message: "Settings updated successfully", data: updatedSettings}, {status: 200,
         headers: CORS_HEADERS
       });

    }catch(error){
        console.log('Error uploading file:', error);
        return NextResponse.json({ message: 'Settings save failed', error }, { status: 500,
            headers: CORS_HEADERS
         });
    }
}