import { NextResponse } from 'next/server';
import prisma from "../../../../lib/prisma";
import valid_stores from '@/config/valid_stores';


const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*', // Allow all origins
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Headers': '*',
  };

export async function GET(req){

        // Set CORS headers

    try{

      
     

       const { searchParams } = new URL(req.url);
       const shopIdentifier = searchParams.get('shopIdentifier');
       const phone = searchParams.get('phone');
       const otp = searchParams.get('otp');

       if(!shopIdentifier){
        return NextResponse.json({ message: 'Shop identifier missing' }, { status: 400, headers: CORS_HEADERS });
       }

       if(!valid_stores.includes(shopIdentifier)){
        return NextResponse.json({ message: 'Invalid shop identifier' }, { status: 400, headers: CORS_HEADERS });
       }

       if(!phone || !otp){
        return NextResponse.json({ message: 'Phone and OTP are required' }, { status: 400, headers: CORS_HEADERS });
       }

       if(otp.trim()===""){
        return NextResponse.json({ message: 'Invalid OTP' }, { status: 400, headers: CORS_HEADERS });
       }

       if(phone.trim()===""){
        return NextResponse.json({ message: 'Invalid phone number' }, { status: 400, headers: CORS_HEADERS });
       }

       if(otp.length < 4){
        return NextResponse.json({ message: 'Invalid OTP' }, { status: 400, headers: CORS_HEADERS });
       }

       if(phone.length<9){
        return NextResponse.json({ message: 'Invalid phone number' }, { status: 400, headers: CORS_HEADERS });
       }

       const lastNineDigits = phone.slice(-9);
       const isOnlyDigits = /^\d+$/.test(lastNineDigits);

       if(!isOnlyDigits){
        return NextResponse.json({ message: 'Invalid phone number' }, { status: 400, headers: CORS_HEADERS });
       }

       const mobileNumber = `94${lastNineDigits}`;

       const existingOTP = await prisma.otp.findUnique({
         where:{
            phone: mobileNumber
         }
       });


       if(!existingOTP){
        return NextResponse.json({ message: 'Invalid OTP' }, { status: 400, headers: CORS_HEADERS });
       }

       if(existingOTP.code !== otp){
        return NextResponse.json({ message: 'Invalid OTP' }, { status: 400, headers: CORS_HEADERS });
       }

       if(existingOTP.expires_at < new Date()){
         await prisma.otp.deleteMany({
            where:{
                phone: mobileNumber
            }
           })
        return NextResponse.json({ message: 'OTP expired' }, { status: 400, headers: CORS_HEADERS });
       }

       await prisma.otp.deleteMany({
        where:{
            phone: mobileNumber
        }
       })

       return NextResponse.json({ message: 'OTP verified successfully' }, { status: 200, headers: CORS_HEADERS });

    }catch(error){
        console.log('Error verifying OTP:', error);
        return NextResponse.json({ message: 'Internal server error', error }, { status: 500,
            headers: CORS_HEADERS
         });
    }
}