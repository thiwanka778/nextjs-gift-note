import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import valid_stores from '@/config/valid_stores';
import {  AES } from 'crypto-js';
import ENC_UTF8 from "crypto-js/enc-utf8"

const SECRET_KEY = process.env.SECRET_KEY;


const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*', // Allow all origins
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Headers': '*',
  };

  function cleanAndUppercase(str) {
    return str.trim().replace(/\s+/g, ' ').toUpperCase();
  }
  

export async function POST(req){


  

        // Set CORS headers

    try{

       const body = await req.json();
       const {shop_identifier,access_token,api_key,secret_key} = body;

       if(!shop_identifier){
        return NextResponse.json({ message: 'Shop identifier missing' }, { status: 400, headers: CORS_HEADERS });
       }

       if(!valid_stores.includes(shop_identifier)){
        return NextResponse.json({ message: 'Invalid shop identifier' }, { status: 400, headers: CORS_HEADERS });
       }

       if(!access_token || access_token.trim()==="" ||  !api_key || api_key.trim()==="" || !secret_key || secret_key.trim()===""){
        return NextResponse.json({ message: 'Missing required fields' }, { status: 400, headers: CORS_HEADERS });
       }

       const cre = await prisma.credential.findUnique({
         where:{
            shop_identifier: shop_identifier
         }
       });

       const encryptedAccessToken = AES.encrypt(access_token, SECRET_KEY).toString();
       const encryptedApiKey = AES.encrypt(api_key, SECRET_KEY).toString();
       const encryptedSecretKey = AES.encrypt(secret_key, SECRET_KEY).toString();

       if(cre){
           await prisma.credential.update({
              where:{
                id: cre.id
              },
              data:{
                access_token: encryptedAccessToken,
                api_key: encryptedApiKey,
                secret_key: encryptedSecretKey
              }
           })
       }else{
        await prisma.credential.create({
          data:{
            shop_identifier: shop_identifier,
            access_token: encryptedAccessToken,
            api_key: encryptedApiKey,
            secret_key: encryptedSecretKey
          }
        })
       }


       const saved = await prisma.credential.findUnique({
         where:{
            shop_identifier: shop_identifier
         }
       });

    //    const decryptedAccessTokenBytes = AES.decrypt(saved.access_token,SECRET_KEY);
    //    const decryptedAccessToken = decryptedAccessTokenBytes.toString(ENC_UTF8);

       return NextResponse.json({message: "Credential saved successfully"}, {status: 201,
         headers: CORS_HEADERS
       });

    }catch(error){
        console.log('Error saving credential:', error);
        return NextResponse.json({ message: 'Credential save failed', error }, { status: 500,
            headers: CORS_HEADERS
         });
    }
}