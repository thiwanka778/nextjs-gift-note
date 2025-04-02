import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
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

        let savedSettings = null;


        if(!settings){
            // we need to create 
            savedSettings = await prisma.schedule_delivery_setting.create({
                data:{
                    shop_identifier: shopIdentifier,
                    enable_delivery: body.enable_delivery,
                    allow_date_pick: body.allow_date_pick,
                    minimum_days: Number(body.minimum_days),
                    apply_delivery_charge: body.apply_delivery_charge,
                    within_colombo_delivery_charge: Number(body.within_colombo_delivery_charge),
                    outside_colombo_delivery_charge: Number(body.outside_colombo_delivery_charge),
                }
            })
        }else{
            // we need to update

            savedSettings = await prisma.schedule_delivery_setting.update({
                where:{
                    id: settings.id
                },
                data:{
                    enable_delivery: body.enable_delivery,
                    allow_date_pick: body.allow_date_pick,
                    minimum_days: Number(body.minimum_days),
                    apply_delivery_charge: body.apply_delivery_charge,
                    within_colombo_delivery_charge: Number(body.within_colombo_delivery_charge),
                    outside_colombo_delivery_charge: Number(body.outside_colombo_delivery_charge), 
                }
            })
        }

        return NextResponse.json({...savedSettings,message:"Settings saved successfully"}, { status: 200, headers: CORS_HEADERS });
    } catch (error) {
        return NextResponse.json({ message: 'Error retrieving shop identifier', error }, { status: 500, headers: CORS_HEADERS });
    }
}