import { NextResponse } from 'next/server';
import prisma from '../../../../../../lib/prisma';
import valid_stores from '@/config/valid_stores';


const preferredCodes  = [
    "LKR",
    "USD", // US Dollar
    "EUR", // Euro
    "JPY", // Japanese Yen
    "GBP", // British Pound
    "AUD", // Australian Dollar
    "CAD", // Canadian Dollar
    "CHF", // Swiss Franc
    "CNY", // Chinese Yuan
    "HKD", // Hong Kong Dollar
    "NZD", // New Zealand Dollar
    "SEK", // Swedish Krona
    "KRW", // South Korean Won
    "SGD", // Singapore Dollar
    "NOK", // Norwegian Krone
    "MXN", // Mexican Peso
    "INR", // Indian Rupee
    "RUB", // Russian Ruble
    "ZAR", // South African Rand
    "TRY", // Turkish Lira
    "BRL", // Brazilian Real
    "TWD", // Taiwan Dollar
    "DKK", // Danish Krone
    "PLN", // Polish Złoty
    "THB", // Thai Baht
    "IDR", // Indonesian Rupiah
    "HUF", // Hungarian Forint
    "CZK", // Czech Koruna
    "ILS", // Israeli Shekel
    "PHP", // Philippine Peso
    "MYR"  // Malaysian Ringgit
  ];
  


const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*', // Allow all origins
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Headers': '*',
  };

export async function GET(req, { params }){

        // Set CORS headers

    try{

        const { shopIdentifier } = await params;


       if(!shopIdentifier){
        return NextResponse.json({ message: 'Shop identifier missing' }, { status: 400, headers: CORS_HEADERS });
       }

       if(!valid_stores.includes(shopIdentifier)){
        return NextResponse.json({ message: 'Invalid shop identifier' }, { status: 400, headers: CORS_HEADERS });
       }


       const allCurrencies = await prisma.currency.findMany();
       let newArray = [];

       for(const currency of allCurrencies){
            const shopCurrency = await prisma.shop_currency.findFirst({
                where:{
                    shop_identifier: shopIdentifier,
                    code: currency.code
                }
            })

            const newObject = {
                code: currency.code,
                rate:shopCurrency? shopCurrency?.rate ? shopCurrency.rate: 0 :0,
                is_default: shopCurrency? shopCurrency?.is_default ? shopCurrency.is_default : false : false,
                name: currency.name,
                country: currency.country,
            }

            newArray.push(newObject);
       }

       const sortedArray = [...newArray].sort((a, b) => {
        const indexA = preferredCodes.indexOf(a.code);
        const indexB = preferredCodes.indexOf(b.code);
    
        if (indexA === -1 && indexB === -1) return 0; // Both are non-preferred, keep order
        if (indexA === -1) return 1; // `a` is non-preferred, push it down
        if (indexB === -1) return -1; // `b` is non-preferred, push it down
    
        return indexA - indexB; // Sort based on `preferredCodes` order
    });

       return NextResponse.json({message: "Updated successfully",data: sortedArray}, {status: 200,
         headers: CORS_HEADERS
       });

       

    }catch(error){
        console.error('Error uploading file:', error);
        return NextResponse.json({ message: 'Settings save failed', error }, { status: 500,
            headers: CORS_HEADERS
         });
    }
}