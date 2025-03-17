import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';



export async function POST(req){

        // Set CORS headers

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
    

    try{



       const body = await req.json();
       const {shop_identifier} = body;

       const settings = await prisma.gift_note_settings.findUnique({
         where: {
            shop_identifier: shop_identifier
         }
       });

       if(!settings){
        // we need to create
        const newSettings = await prisma.gift_note_settings.create({
            data: body
        });
       }else{
        // we need to update
        const updatedSettings = await prisma.gift_note_settings.update({
            where:{
                id: settings.id
            },
            data: body
        })
       }

       return NextResponse.json({message: "Settings saved successfully"}, {status: 200});

    }catch(error){
        console.log('Error uploading file:', error);
        return NextResponse.json({ message: 'Settings save failed', error }, { status: 500 });
    }
}