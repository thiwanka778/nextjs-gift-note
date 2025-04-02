import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import valid_stores from '@/config/valid_stores';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*', // Allow all origins
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Headers': '*',
  };

export async function POST(req, { params }) {
    
    try {
      

        const body = await req.json();
        const {shopIdentifier} = body;

        if(!shopIdentifier){
            return NextResponse.json({ message: 'Shop identifier missing' }, { status: 400, headers: CORS_HEADERS });
        }



        if(!valid_stores.includes(shopIdentifier)){
            return NextResponse.json({ message: 'Invalid shop identifier' }, { status: 400, headers: CORS_HEADERS });
        }
        
        const settings = await prisma.schedule_delivery_setting.findUnique({
            where:{
                shop_identifier: shopIdentifier,
            }
        });

        
        if(!settings){
            // we need to create 
           console.log("settings not found");
        }else{
            // we need to update

            if(!settings?.within_colombo_shopify_product_id && !settings?.outside_colombo_shopify_product_id){
                const savedSettings = await prisma.schedule_delivery_setting.update({
                    where:{
                        id: settings.id
                    },
                    data:{
                        within_colombo_shopify_product_id: body.within_colombo_shopify_product_id,
                        within_colombo_shopify_variant_id: body.within_colombo_shopify_variant_id,
                        within_colombo_shopify_inventory_item_id: body.within_colombo_shopify_inventory_item_id,
                        outside_colombo_shopify_product_id: body.outside_colombo_shopify_product_id,
                        outside_colombo_shopify_variant_id: body.outside_colombo_shopify_variant_id,
                        outside_colombo_shopify_inventory_item_id: body.outside_colombo_shopify_inventory_item_id,
                    }
                })
            }

           
        }

        return NextResponse.json({...savedSettings,message:"Settings saved successfully"}, { status: 200, headers: CORS_HEADERS });
    } catch (error) {
        return NextResponse.json({ message: 'Error retrieving shop identifier', error }, { status: 500, headers: CORS_HEADERS });
    }
}