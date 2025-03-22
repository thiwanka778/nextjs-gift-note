import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
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

       // data =[{code: "USD", rate: 1.00,is_default: false}, {code: "LKR", rate: 200.00,is_default: true}]

       // I need to count how many objects are is_default true

       const isDefaultCount = data.filter(item => item.is_default).length;


       if(isDefaultCount !== 1){
        return NextResponse.json({ message: 'Only one currency can be default' }, { status: 400, headers: CORS_HEADERS });
       }
     

       const { searchParams } = new URL(req.url);
       const shopIdentifier = searchParams.get('shopIdentifier');

       if(!shopIdentifier){
        return NextResponse.json({ message: 'Shop identifier missing' }, { status: 400, headers: CORS_HEADERS });
       }

       if(!valid_stores.includes(shopIdentifier)){
        return NextResponse.json({ message: 'Invalid shop identifier' }, { status: 400, headers: CORS_HEADERS });
       }


       for(const item of data){
        if(item && item?.code && item.code.trim()!==""){
             const currency = await prisma.currency.findUnique({
                where:{
                    code: item.code
                }
             })
             if(currency){
                const duplicate = await prisma.shop_currency.findFirst({
                    where:{
                        shop_identifier: shopIdentifier,
                        code: item.code
                    }
                });
                if(!duplicate){
                    // create new shop currency
                    await prisma.shop_currency.create({
                        data:{
                            shop_identifier: shopIdentifier,
                            code: item.code,
                            rate: item.rate || 0,
                            is_default: item.is_default || false
                        }
                    })

                }else{
                    // update
                    await prisma.shop_currency.update({
                        where:{
                            id: duplicate.id
                        },
                        data:{
                            rate: item.rate || duplicate.rate,
                            is_default: item.is_default || duplicate.is_default
                        }
                    })
                }
                
             }
        }
       }



       return NextResponse.json({message: "Updated successfully"}, {status: 200,
         headers: CORS_HEADERS
       });

    }catch(error){
        console.log('Error uploading file:', error);
        return NextResponse.json({ message: 'Settings save failed', error }, { status: 500,
            headers: CORS_HEADERS
         });
    }
}