import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

export async function POST(req, { params }) {
    try {
        // Extract shopIdentifier from the URL
         const body = await req.json();
         const {id } = body;

         if(!id){
            return NextResponse.json({ message: 'Template id missing' }, { status: 400 });
         }

         const findShopTemplate = await prisma.shop_template.findUnique({
            where: { id }
         })

         if(!findShopTemplate){
            return NextResponse.json({ message: 'Template not found' }, { status: 404 });
         }


        const shopTemplate = await prisma.shop_template.update({
            where: { id },
            data: {
                is_active: findShopTemplate.is_active ? false : true
            }
        });

        return NextResponse.json({ message: 'Template status updated' }, { status: 200 });
         
    } catch (error) {
        return NextResponse.json({ message: 'Error retrieving shop identifier', error }, { status: 500 });
    }
}