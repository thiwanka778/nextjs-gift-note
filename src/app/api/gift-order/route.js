import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import valid_stores from '@/config/valid_stores';


const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*', // Allow all origins
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Headers': '*',
  };

export async function POST(req){

    try{

       const body = await req.json();
       const {shop_identifier,note} = body;


       if(!shop_identifier){
        return NextResponse.json({ message: 'Shop identifier missing' }, { status: 400, headers: CORS_HEADERS });
       }

       if(!valid_stores.includes(shop_identifier)){
        return NextResponse.json({ message: 'Invalid shop identifier' }, { status: 400, headers: CORS_HEADERS });
       }

       if(!note){
        return NextResponse.json({ message: 'Note missing' }, { status: 400, headers: CORS_HEADERS });
       }

      const existing = await prisma.gift_order.findUnique({
        where:{
            note: note
        }
      });

      if(!existing){
         await prisma.gift_order.create({
            data:body
         })
      }else{
         await prisma.gift_order.update({
             where:{
                id: existing.id
             },
             data:body
         })
      }

       return NextResponse.json({message: "Gift order created successfully"}, {status: 200,
         headers: CORS_HEADERS
       });

    }catch(error){
        console.log('Error uploading file:', error);
        return NextResponse.json({ message: 'Gift order creation failed', error }, { status: 500,
            headers: CORS_HEADERS
         });
    }
}