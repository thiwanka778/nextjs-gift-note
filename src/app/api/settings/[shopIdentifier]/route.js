import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import valid_stores from '@/config/valid_stores';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*', // Allow all origins
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Headers': '*',
  };

export async function GET(req, { params }) {
    
    try {
        // Extract shopIdentifier from the URL
        const { shopIdentifier } = await params;

        if(!shopIdentifier){
            return NextResponse.json({ message: 'Shop identifier missing' }, { status: 400, headers: CORS_HEADERS });
        }

        if(!valid_stores.includes(shopIdentifier)){
            return NextResponse.json({ message: 'Invalid shop identifier' }, { status: 400, headers: CORS_HEADERS });
        }
        
        const settings = await prisma.gift_note_settings.findUnique({
            where:{
                shop_identifier: shopIdentifier,
            }
        })

        if(!settings){
            return NextResponse.json({ message: 'Settings not found' }, { status: 404, headers: CORS_HEADERS });
        }

        return NextResponse.json({...settings,message:"Settings retrieved successfully"}, { status: 200, headers: CORS_HEADERS });

    } catch (error) {
        return NextResponse.json({ message: 'Error retrieving shop identifier', error }, { status: 500, headers: CORS_HEADERS });
    }
}