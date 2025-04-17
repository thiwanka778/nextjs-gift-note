import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import valid_stores from '@/config/valid_stores';
import { validateGatewayRequest } from '../../../../../lib/validateRequest';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*', // Allow all origins
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Headers': '*',
  };

export async function POST(req, { params }) {
    try {
        // Extract shopIdentifier from the URL
         const body = await req.json();
         const {id } = body;

         const { searchParams } = new URL(req.url);
         const sessionToken = searchParams.get('x-shopify-session-token');
         const shop_identifier = searchParams.get("shopIdentifier");
         const app = searchParams.get("app");

         if(!app){
            return NextResponse.json({ message: 'App missing' }, { status: 400, headers: CORS_HEADERS });
         }

         if(!sessionToken){
            return NextResponse.json({ message: 'Session token missing' }, { status: 400, headers: CORS_HEADERS });
         }

         if(!shop_identifier){
            return NextResponse.json({ message: 'Shop identifier missing' }, { status: 400, headers: CORS_HEADERS });
         }

         if(!valid_stores.includes(shop_identifier)){
            return NextResponse.json({ message: 'Invalid shop identifier' }, { status: 400, headers: CORS_HEADERS });
         }

         if(!id){
            return NextResponse.json({ message: 'Template id missing' }, { status: 400, headers: CORS_HEADERS });
         }

         const findShopTemplate = await prisma.shop_template.findUnique({
            where: { id }
         })

         if(!findShopTemplate){
            return NextResponse.json({ message: 'Template not found' }, { status: 404, headers: CORS_HEADERS });
         }

         const validation = await validateGatewayRequest(sessionToken,shop_identifier,app);

         if(!validation.isValid){
            return validation.response;
         }
        const shopTemplate = await prisma.shop_template.update({
            where: { id },
            data: {
                is_deleted: true
            }
        });

        return NextResponse.json({ message: 'Template deleted successfully' }, { status: 200, headers: CORS_HEADERS });
         
    } catch (error) {
        return NextResponse.json({ message: 'Error retrieving shop identifier', error }, { status: 500, headers: CORS_HEADERS });
    }
}