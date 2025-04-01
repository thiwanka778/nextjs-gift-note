import { NextResponse } from 'next/server';
import prisma from "../../../../../../lib/prisma";
import valid_stores from '@/config/valid_stores';
import twilio from 'twilio';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*', // Allow all origins
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Headers': '*',
};


const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

const client = twilio(accountSid, authToken);



export async function GET(req){

    const {searchParams} = new URL(req.url);
    const phone = searchParams.get("phone");
    const otp = searchParams.get("otp");
    const shopIdentifier = searchParams.get("shopIdentifier");

    if(!phone || !otp){
        return NextResponse.json({ message: 'Invalid request' }, { status: 400, headers: CORS_HEADERS });
    }

    if(!shopIdentifier){
        return NextResponse.json({ message: 'Invalid request' }, { status: 400, headers: CORS_HEADERS });
    }

    if(!valid_stores.includes(shopIdentifier)){
        return NextResponse.json({ message: 'Invalid request' }, { status: 400, headers: CORS_HEADERS });
    }


    if(phone.trim()===""){
        return NextResponse.json({ message: 'Invalid request' }, { status: 400, headers: CORS_HEADERS });
    }

    if(phone.length<5){
        return NextResponse.json({ message: 'Invalid request' }, { status: 400, headers: CORS_HEADERS });
    }

    let mobileNumber ="";
    if(!phone.startsWith("+")){
        mobileNumber = `+${phone}`
    }else{
        mobileNumber = phone;
    }
    

    try{

        const verificationCheck = await client.verify.v2.services(verifyServiceSid).verificationChecks.create({
            to:mobileNumber, code:otp
        });

       
       if(verificationCheck.status==="approved"){
        return NextResponse.json({ message: 'OTP verified successfully' }, { status: 200, headers: CORS_HEADERS });
       }else{
        return NextResponse.json({ message: 'Invalid OTP' }, { status: 400, headers: CORS_HEADERS });
       }

    }catch(error){
        console.log(error);
        return NextResponse.json({ message: 'Already used' }, { status: 500, headers: CORS_HEADERS });
    }
}


