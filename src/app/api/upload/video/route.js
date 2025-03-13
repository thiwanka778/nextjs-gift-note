import { NextResponse } from 'next/server';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { firebaseStorage } from '@/config/firebaseConfig';
import prisma from "../../../../../lib/prisma";



export async function POST(req){
    try{

        if (!req.headers.get('content-type').includes('multipart/form-data')) {
            return NextResponse.json({ message: 'Invalid content type' }, { status: 400 });
          }

          const formData = await req.formData();
          const file = formData.get('file');
          const filePath = formData.get('filePath');
          const orderId = formData.get('orderId');

          if(!orderId){
            return NextResponse.json({ message: 'Order id missing' }, { status: 400 });
          }

           const duplicate  = await prisma.video_message.findMany({
             where:{
              order_id: orderId,
             }
           })

           if(duplicate.length > 0){
            return NextResponse.json({ message: 'Duplicate video message' }, { status: 400 });
           }
      
          if (!file || !filePath) {
            return NextResponse.json({ message: 'File or filePath missing' }, { status: 400 });
          }

          const storageRef = ref(firebaseStorage, filePath);

          const uploadTask = uploadBytesResumable(storageRef, file);

          const uploadTaskSnapshot = await new Promise((resolve, reject) => {
            uploadTask.on(
              'state_changed',
              null,
              (error) => reject(error),
              () => resolve(uploadTask.snapshot)
            );
          });

          const downloadURL = await getDownloadURL(uploadTaskSnapshot.ref);
          const filePathRef = uploadTaskSnapshot.ref.fullPath;
          const fileName = uploadTaskSnapshot.ref.name;

          const savedVideo = await prisma.video.create({
            data:{
              file_name: fileName,
              file_path: filePathRef,
              mime_type: uploadTaskSnapshot.metadata.contentType,
              url: downloadURL,
              file_size: uploadTaskSnapshot.metadata.size,

            }
          });

          if(!savedVideo){
            return NextResponse.json({ message: 'Failed to save upload' }, { status: 500 });
          }

          const duplicateCheck = await prisma.video_message.findMany({
            where:{
              order_id: orderId,
              video_id: savedVideo.id,
            }
          })

          if(duplicateCheck.length > 0){
            return NextResponse.json({ message: 'Duplicate video message' }, { status: 400 });
          }

          const savedVideoMessage = await prisma.video_message.create({
            data:{
              order_id: orderId,
              video_id: savedVideo.id,
            }
          });

          if(!savedVideoMessage){
            return NextResponse.json({ message: 'Failed to save shop template' }, { status: 500 });
          }
          return NextResponse.json({ downloadURL, filePath: filePathRef, fileName, mimeType: uploadTaskSnapshot.metadata.contentType }, { status: 200 });

    }catch(error){
        console.log('Error uploading file:', error);
        return NextResponse.json({ message: 'File upload failed', error }, { status: 500 });
    }
}