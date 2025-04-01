import { NextResponse } from 'next/server';
import prisma from "../../../../../lib/prisma";
import valid_stores from '@/config/valid_stores';
import axios from 'axios';


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

        if(phone.length < 9){
            return NextResponse.json({ message: 'Invalid phone number' }, { status: 400, headers: CORS_HEADERS });
        }

        const lastNineDigits = phone.slice(-9);
        const isOnlyDigits = /^\d+$/.test(lastNineDigits);

        if(!isOnlyDigits){
            return NextResponse.json({ message: 'Invalid phone number' }, { status: 400, headers: CORS_HEADERS });
        }

        const mobileNumber = `94${lastNineDigits}`;

        const existingOTP = await prisma.otp.findFirst({
            where:{
                phone:mobileNumber
            }
        });

        if(existingOTP){
            // I need to check created_at and now current time difference
            const currentTime = new Date();
            const timeDifference = currentTime - existingOTP.created_at;
            const secondsDifference = timeDifference / 1000;

            if(secondsDifference < 30 ){
                return NextResponse.json({ message: 'Please wait before requesting another OTP' }, { status: 429, headers: CORS_HEADERS });
            }
        }

         await prisma.otp.deleteMany({
            where:{
                phone:mobileNumber
            }
         });


        const accessToken = await hutchLogin();

        if(!accessToken){
            return NextResponse.json({ message: 'Failed to get access token' }, { status: 500, headers: CORS_HEADERS });
        }

        const OTP = generateRandomSixDigit();

        const isSent = await hutchSendSMS(mobileNumber,OTP,accessToken);

        if(!isSent){
            return NextResponse.json({ message: 'Failed to send SMS' }, { status: 500, headers: CORS_HEADERS });
        }

        await prisma.otp.create({
            data:{
                phone:mobileNumber,
                code:OTP,
                expires_at:new Date(Date.now()+1000*60*5)
            }
        })

        return NextResponse.json({ message: 'SMS sent successfully' }, { status: 200, headers: CORS_HEADERS });
        
    
    }catch(error){
        console.log("ERROR IN SMS SEND",error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500, headers: CORS_HEADERS });
    }

}


function generateRandomSixDigit() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

const hutchLogin = async ()=>{
    const maxRetries=3;
    const retryDelay=2000;
    let attempts=0;

    const payload={
        username:process.env.HUTCH_USERNAME,
        password:process.env.HUTCH_PASSWORD
    }

    while(attempts<maxRetries){

        try{

            const response = await axios.post("https://bsms.hutch.lk/api/login",payload, {
                headers:{
                    "Content-Type":"application/json",
                    "X-API-VERSION": "v1"
                }
            })
    
            if(response?.data?.accessToken ){
                 return response.data.accessToken;
            }else{
                console.log("FAILED TO GET THE ACCESS TOKEN")
            }
    
        }catch(error){
            console.log("ERROR IN HUTCH LOGIN",error);
        }

        attempts++;
        await new Promise(resolve => setTimeout(resolve, retryDelay));

    }
    return null;
   
}

const hutchSendSMS = async (phone,OTP, accessToken)=>{

    const maxRetries=3;
    const retryDelay=2000;
    let attempts=0;

    const payload={
       "campaignName": "Loyalty",
       "mask": "SpaCeylon",
       "numbers": phone,
       "content": `Your OTP is ${OTP}`
    }


    while(attempts<maxRetries){

        try{
            const response = await axios.post("https://bsms.hutch.lk/api/sendsms",payload, {
                headers:{
                    "Authorization":`Bearer ${accessToken}`,
                    "Content-Type":"application/json",
                    "X-API-VERSION": "v1"
                }
            });
    
            if(response?.status === 200){
                return true;
            }else{
                console.log("FAILED TO SEND SMS")
            }
    
        }catch(error){
            console.log("ERROR IN HUTCH SEND SMS",error);
        }

        attempts++;
        await new Promise(resolve => setTimeout(resolve, retryDelay));

    }
    return false;
   
}
