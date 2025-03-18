import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import valid_stores from '@/config/valid_stores';


const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*', // Allow all origins
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Headers': '*',
  };

export async function POST(req){

        // Set CORS headers

    try{

       const body = await req.json();
       const {shop_identifier} = body;


       if(!shop_identifier){
        return NextResponse.json({ message: 'Shop identifier missing' }, { status: 400, headers: CORS_HEADERS });
       }

       if(!valid_stores.includes(shop_identifier)){
        return NextResponse.json({ message: 'Invalid shop identifier' }, { status: 400, headers: CORS_HEADERS });
       }

       const settings = await prisma.gift_note_settings.findUnique({
         where: {
            shop_identifier: shop_identifier
         }
       });

       if(!settings){
        // we need to create
        const newSettings = await prisma.gift_note_settings.create({
            data: body
        });
       }else{
        // we need to update
        const updatedSettings = await prisma.gift_note_settings.update({
            where:{
                id: settings.id
            },
            data: body
        })
       }

       return NextResponse.json({message: "Settings saved successfully"}, {status: 200,
         headers: CORS_HEADERS
       });

    }catch(error){
        console.log('Error uploading file:', error);
        return NextResponse.json({ message: 'Settings save failed', error }, { status: 500,
            headers: CORS_HEADERS
         });
    }
}