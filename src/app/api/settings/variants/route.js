

import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { validateGatewayRequest } from '../../../../../lib/validateRequest';
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
       const {shop_identifier, physical_variant_id, virtual_variant_id,physical_product_id,virtual_product_id,
         physical_inventory_item_id,virtual_inventory_item_id} = body;


         const { searchParams } = new URL(req.url);
         const sessionToken = searchParams.get('x-shopify-session-token');
         const app = searchParams.get('app');

         if(!sessionToken){
          return NextResponse.json({ message: 'Session token missing' }, { status: 400, headers: CORS_HEADERS });
         }


       if(!shop_identifier){
        return NextResponse.json({ message: 'Shop identifier missing' }, { status: 400, headers: CORS_HEADERS });
       }

       if(!valid_stores.includes(shop_identifier)){
        return NextResponse.json({ message: 'Invalid shop identifier' }, { status: 400, headers: CORS_HEADERS });
       }
       if(!app){
        return NextResponse.json({ message: 'App missing' }, { status: 400, headers: CORS_HEADERS });
       }


       const validation = await validateGatewayRequest(sessionToken, shop_identifier,app);

       if(!validation.isValid){
        return validation.response;
       }

     

       const settings = await prisma.gift_note_settings.findUnique({
         where: {
            shop_identifier: shop_identifier
         }
       });

       if(!settings){
           console.log('Settings not found');
       }else{

           // we need to update
           const updateData={};
           const fields = [
            'physical_variant_id',
            'virtual_variant_id',
            'physical_product_id',
            'virtual_product_id',
            'physical_inventory_item_id',
            'virtual_inventory_item_id'
          ];

          for (const field of fields) {
            const value = body[field];
            if (!settings[field] && value && value.trim() !== "") {
              updateData[field] = value;
            }
          }

          if (Object.keys(updateData).length > 0) {
            await prisma.gift_note_settings.update({
              where: {
                id: settings.id
              },
              data: updateData
            });
          }else{
            console.log('No updates needed');
          }
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