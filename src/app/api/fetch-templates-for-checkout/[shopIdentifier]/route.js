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




           // Parse the query parameters for pagination
           const { searchParams } = new URL(req.url);
           const page = parseInt(searchParams.get('page')) || 1;  // Default page 1
           const size = parseInt(searchParams.get('size')) || 10; // Default size 10
           const skip = (page - 1) * size;

            // Get total count for pagination metadata
        const totalRecords = await prisma.shop_template.count({
            where: {
                shop_identifier: shopIdentifier,
                is_deleted: false,
                is_active: true,
            },
        });

        console.log("totalRecords", totalRecords);

        
        const shopTemplates = await prisma.shop_template.findMany({
            where:{
                shop_identifier: shopIdentifier,
                is_deleted: false,
                is_active: true,
            },
            orderBy:{
                created_at: 'desc',
            },
            skip,
            take: size,
        });

        


        let templateData = [];

        for(const template of shopTemplates){
            const savedUpload = await prisma.upload.findUnique({
                where:{
                    id: template.upload_id,
                }
            });
            if(savedUpload){
                templateData.push({
                    ...template, upload: savedUpload,
                })
            }
           
        }
        return NextResponse.json({
            message: "success",
            content: templateData,
            pagination: {
                currentPage: page,
                pageSize: size,
                totalElements: totalRecords,
                totalPages: Math.ceil(totalRecords / size),
                isFirst: page === 1,
                isLast: page === Math.ceil(totalRecords / size),
            }
        }, { status: 200, headers: CORS_HEADERS });
    } catch (error) {
        return NextResponse.json({ message: 'Error retrieving shop identifier', error }, { status: 500, headers: CORS_HEADERS });
    }
}