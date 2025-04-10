import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { validateGatewayRequest } from '../../../../../lib/validateRequest';
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
        const {searchParams} = new URL(req.url);

        const sessionToken = searchParams.get('x-shopify-session-token');

        if(!sessionToken){
            return NextResponse.json({ message: 'Session token missing' }, { status: 400, headers: CORS_HEADERS });
        }


        if(!shopIdentifier){
            return NextResponse.json({ message: 'Shop identifier missing' }, { status: 400, headers: CORS_HEADERS });
        }

        if(!valid_stores.includes(shopIdentifier)){
            return NextResponse.json({ message: 'Invalid shop identifier' }, { status: 400, headers: CORS_HEADERS });
        }


        const validation = await validateGatewayRequest(sessionToken,shopIdentifier);
        if (!validation.isValid) {
         return validation.response;
       }

        
        const settings = await prisma.message_gateway.findMany({
            where:{
                shop_identifier: shopIdentifier
            }
        })

        return NextResponse.json({message:"Settings retrieved successfully", content: settings}, { status: 200, headers: CORS_HEADERS });

    } catch (error) {
        return NextResponse.json({ message: 'Error retrieving shop identifier', error }, { status: 500, headers: CORS_HEADERS });
    }
}