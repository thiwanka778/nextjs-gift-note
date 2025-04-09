import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import valid_stores from '@/config/valid_stores';


const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*', // Allow all origins
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Headers': '*',
  };

  function cleanAndUppercase(str) {
    return str.trim().replace(/\s+/g, ' ').toUpperCase();
  }
  

export async function PUT(req){

        // Set CORS headers

    try{

       const body = await req.json();
       const {shop_identifier,id,is_default} = body;

       if(!id){
        return NextResponse.json({ message: 'Id missing' }, { status: 400, headers: CORS_HEADERS });
       }

       if(!shop_identifier){
        return NextResponse.json({ message: 'Shop identifier missing' }, { status: 400, headers: CORS_HEADERS });
       }

       if(!valid_stores.includes(shop_identifier)){
        return NextResponse.json({ message: 'Invalid shop identifier' }, { status: 400, headers: CORS_HEADERS });
       }


       const settings = await prisma.message_gateway.findUnique({
        where:{
            id: parseInt(id,10),
        }
       });

       if(!settings){
        return NextResponse.json({ message: 'Settings not found' }, { status: 400, headers: CORS_HEADERS });
       }


       const updatedSettings = await prisma.message_gateway.update({
        where:{
            id: settings.id
        },
        data:{
            is_default: is_default
        }
       })

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