import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';



export async function POST(req){
    try{

       const body = await req.json();
       const {orderId} = body;

       if(!orderId){
        return NextResponse.json({ message: 'Order ID is required' }, { status: 400 });
       }

       const duplicates  = await prisma.video_message.findMany({
        where: {
            order_id: orderId
        }
       })

       if(duplicates.length > 0){
        return NextResponse.json({ message: 'Order ID already used', alreadyUsed: true }, { status: 200 });
       }else{
        return NextResponse.json({ message: 'Order ID not used', alreadyUsed: false }, { status: 200 });
       }

    

    }catch(error){
        console.log('Error uploading file:', error);
        return NextResponse.json({ message: 'Settings save failed', error }, { status: 500 });
    }
}