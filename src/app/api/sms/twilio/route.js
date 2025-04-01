import { NextResponse } from 'next/server';
import prisma from "../../../../../lib/prisma";
import valid_stores from '@/config/valid_stores';
import twilio from 'twilio';


const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;


const client = twilio(accountSid,authToken);


const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*', // Allow all origins
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Headers': '*',
};

export async function POST(req){

    
    try{

        const {phone, shopIdentifier} = await req.json();

        if(!phone || !shopIdentifier){
            return NextResponse.json({ message: 'Phone and shopIdentifier are required' }, { status: 400, headers: CORS_HEADERS });
        }

        if(!valid_stores.includes(shopIdentifier)){
            return NextResponse.json({ message: 'Invalid shopIdentifier' }, { status: 400, headers: CORS_HEADERS });
        }

        if(phone.trim()===""){
            return NextResponse.json({ message: 'Invalid phone number' }, { status: 400, headers: CORS_HEADERS });
        }

        if(phone.length < 5){
            return NextResponse.json({ message: 'Invalid phone number' }, { status: 400, headers: CORS_HEADERS });
        }

        let mobileNumber ="";
        if(!phone.startsWith("+")){
            mobileNumber = `+${phone}`
        }else{
            mobileNumber = phone;
        }


        const verification = await client.verify.v2.services(verifyServiceSid).verifications.create({
            to:mobileNumber,channel:"sms"
        });

    
        if(verification.status === "approved" || verification.status === "pending"){
            return NextResponse.json({ message: 'OTP sent successfully' }, { status: 200, headers: CORS_HEADERS });
        }else{
            return NextResponse.json({ message: 'Failed to send OTP' }, { status: 500, headers: CORS_HEADERS });
        }

        
    }catch(error){
        console.log("ERROR IN SMS SEND",error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500, headers: CORS_HEADERS });
    }

}





