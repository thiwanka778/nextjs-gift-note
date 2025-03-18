import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import valid_stores from '@/config/valid_stores';


const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*', // Allow all origins
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
  'Access-Control-Allow-Headers': '*',
};

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });


  function generateRandomStringWithUnderscore(length = 32) {
 

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
  
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
  
    const underscorePosition = Math.floor(Math.random() * (length - 2)) + 1; // Ensure underscore is not at start or end.
    result = result.substring(0, underscorePosition) + '_' + result.substring(underscorePosition + 1);
  
    return result;
  }



export async function POST(req){
    try{

        if (!req.headers.get('content-type').includes('multipart/form-data')) {
            return NextResponse.json({ message: 'Invalid content type' }, { status: 400,
              headers: CORS_HEADERS
             });
          }

          const formData = await req.formData();
          const file = formData.get('file');
          const shopIdentifier = formData.get('shopIdentifier');


          if(!shopIdentifier) return NextResponse.json({ error: "Shop identifier is required" }, { status: 400,
            headers: CORS_HEADERS
           });

           if(!valid_stores.includes(shopIdentifier)) return NextResponse.json({ message: "Invalid shop identifier" }, { status: 400,
            headers: CORS_HEADERS
           });

          if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400,
            headers: CORS_HEADERS
           });

              // Convert File to Buffer
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const now = new Date();
          const milliseconds = now.getTime();
          const randomString = generateRandomStringWithUnderscore();

          const fileName = `${file.name}-${randomString}-${milliseconds}`;
          const fileKey = `templates/${fileName}`;
          const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileKey,
            Body: buffer,
            ContentType: file.type,
          };

          await s3.send(new PutObjectCommand(params));

             // Generate Pre-signed URL for accessing the file
       const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileKey,
        });

       const headCommand = new HeadObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileKey
       });


           const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60*60*24*3 });

            // Generate File URL
        //    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

        

          const headResponse = await s3.send(headCommand);


           const savedFile = await prisma.upload.create({
              data:{
                file_name: fileName,
                file_path: fileKey,
                mime_type: headResponse.ContentType,
                file_size: headResponse.ContentLength,
                url: signedUrl,
              }
           });

           if(!savedFile){
            return NextResponse.json({ message: "File uploaded successfully to AWS S3, but failed to save to local database", error: "Failed to save file to local database" }, 
              { status: 500, headers: CORS_HEADERS });
           }

           const duplicates = await prisma.shop_template.findMany({
             where:{
               shop_identifier: shopIdentifier,
               upload_id: savedFile.id
             }
           });

           if(duplicates.length === 0){
             const savedShopTemplate = await prisma.shop_template.create({
                 data:{
                  shop_identifier: shopIdentifier,
                  upload_id: savedFile.id
                 }
              });

              if(savedShopTemplate){
                return NextResponse.json({ message: "File uploaded successfully to AWS S3 and local database"}, { status: 200,
                  headers: CORS_HEADERS
                 });
              }
           }

           return NextResponse.json({ message: "File already exists in local database",
             error: "File already exists in local database" }, { status: 400, headers: CORS_HEADERS });
      

    }catch(error){
        console.log('Error uploading file:', error);
        return NextResponse.json({ message: 'File upload failed', error }, { status: 500, headers: CORS_HEADERS });
    }
}