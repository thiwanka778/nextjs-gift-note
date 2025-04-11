import valid_stores from "@/config/valid_stores";
import { NextResponse,NextRequest } from "next/server";
import prisma from "./prisma";
import jwt from "jsonwebtoken";
import { decryptAES } from "./decrypt";

const SECRET_KEY = process.env.SECRET_KEY;


const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Headers': '*',
  };


export async function validateGatewayRequest(sessionToken,shop_identifier){
        
    try{

        const credential = await prisma.credential.findUnique({
            where:{
                shop_identifier: shop_identifier
            }
        });

        if(!credential){
            return {
                isValid: false,
                response: NextResponse.json({ message: 'Unauthorized' }, { status: 401, headers: CORS_HEADERS }),
              }; 
        }

        if(!sessionToken){
            return {
                isValid: false,
                response: NextResponse.json({ message: 'Unauthorized' }, { status: 401, headers: CORS_HEADERS }),
              }; 
        }

        const strToken = String(sessionToken);
        if(!strToken || strToken.trim()===""){
            return {
                isValid: false,
                response: NextResponse.json({ message: 'Unauthorized' }, { status: 401, headers: CORS_HEADERS }),
              }; 
        }

        if(!credential.secret_key){
           return {
            isValid: false,
            response: NextResponse.json({ message: 'Unauthorized' }, { status: 401, headers: CORS_HEADERS }),
           }
        }

        const decryptedSecretKey = await decryptAES(credential.secret_key,SECRET_KEY);

       


        if(!decryptedSecretKey){
            return{
                isValid: false,
                response: NextResponse.json({ message: 'Unauthorized' }, { status: 401, headers: CORS_HEADERS }),
            }
        }

        const verifiedToken = jwt.verify(strToken, decryptedSecretKey,{
            algorithms: ['HS256']
        });

        const {dest} = verifiedToken;

        if(!dest){
            return{
                isValid: false,
                response: NextResponse.json({ message: 'Unauthorized' }, { status: 401, headers: CORS_HEADERS }),
            }
        }
       

        const httpsi = `https://${shop_identifier}`;

        if(dest === httpsi){
            console.log("SUCCESSFULLY VERIFIED")
            return{
                isValid: true,
                response: NextResponse.json({ message: 'Authorized' }, { status: 200, headers: CORS_HEADERS }),
            }

        }else{
            return {
                isValid: false,
                response: NextResponse.json({ message: 'Unauthorized' }, { status: 401, headers: CORS_HEADERS }),
            }
        }

    }catch(error){
        console.log("ERROR",error);
        return {
            isValid: false,
            response: NextResponse.json({ message: 'Unauthorized' }, { status: 401, headers: CORS_HEADERS }),
          };
    }

}

