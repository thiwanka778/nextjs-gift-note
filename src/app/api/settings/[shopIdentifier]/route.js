import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

export async function GET(req, { params }) {
    try {
        // Extract shopIdentifier from the URL
        const { shopIdentifier } = await params;

        if(!shopIdentifier){
            return NextResponse.json({ message: 'Shop identifier missing' }, { status: 400 });
        }
        
        const settings = await prisma.gift_note_settings.findUnique({
            where:{
                shop_identifier: shopIdentifier,
            }
        })

        if(!settings){
            return NextResponse.json({ message: 'Settings not found' }, { status: 404 });
        }

        return NextResponse.json({...settings,message:"Settings retrieved successfully"}, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: 'Error retrieving shop identifier', error }, { status: 500 });
    }
}