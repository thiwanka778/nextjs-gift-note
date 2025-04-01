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
       const {data} = body;

      
       for(const item of data){
          if(item && item?.code && item.code.trim()!==""){

             const duplicate = await prisma.currency.findUnique({
                where:{
                    code: item.code
                }
             });
               
             if(!duplicate){
                
                await prisma.currency.create({
                    data: {
                        code: item.code,
                        name: item.name || "",
                        country: item.country || ""
                    }
                })
               
             }
          }
       }

   

       const dbcurrencies = await prisma.currency.findMany();

       return NextResponse.json({message: "Currencies saved successfully", data: dbcurrencies}, {status: 200,
         headers: CORS_HEADERS
       });

    }catch(error){
        console.log('Error uploading file:', error);
        return NextResponse.json({ message: 'Settings save failed', error }, { status: 500,
            headers: CORS_HEADERS
         });
    }
}