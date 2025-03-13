'use client'
import React,{useState, useEffect} from 'react';
import "./giftNoteStyles.css";
import { Checkbox } from 'antd';
import { nanoid } from 'nanoid';
import { useSearchParams } from 'next/navigation';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PreviewIcon from '@mui/icons-material/Preview';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { useStore } from '@/zustand/useStore';

// f3eb956b-58dd-4ea2-87a3-7f77d7bf195f

const GiftNote = () => {
    const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const {uploadFileToFirebase, isUploading, fetchShopTemplates, shopTemplateData, shopTemplatePagination,
    isSavingSettings, createOrUpdateSettings, saveSettingsStatus, fetchSettingsAPI, giftNoteSettingsData,
    updateShopTemplateStatus,isDeletingShopTemplate,deleteShopTemplateAPI,
  } = useStore();
    const [enableGiftNotes, setEnableGiftNotes] = useState(false);
    const [saveSettingsMessage, setSaveSettingsMessage] = useState("");
    const [openDelete, setOpenDelete] = React.useState(false);
    const [selectedFilesLength, setSelectedFilesLength] = useState(0);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [shopTemplateObject, setShopTemplateObject] = useState(null);
    const [enableVideoMessages, setEnableVideoMessages] = useState(false);
    const [applyServiceCharge, setApplyServiceCharge] = useState(false);
    const [enableDeliveryDate, setEnableDeliveryDate] = useState(false);
    const [isTemplateUploading, setIsTemplateUploading] = useState(false);
    const [formData, setFormData]= useState({
        maxVideoLength: "",
        maxMessageLength: "",
        serviceChargePhysicalDelivery: "",
        serviceChargeVirtualDelivery: "",
    });

    const [openViewTemplate, setOpenViewTemplate] = useState(false);

    const handleClickopenViewTemplate = () => {
      setOpenViewTemplate(true);
    };

    const handleCloseopenViewTemplate=()=>{
      setOpenViewTemplate(false);
      setShopTemplateObject(null);

    }


  

    const handleClickOpenDelete = () => {
      setOpenDelete(true);
    };
  
    const handleCloseDelete = () => {
      setOpenDelete(false);
      setShopTemplateObject(null);
     
    };

    const  handleTemplateDeleteClick=(data)=>{
      setShopTemplateObject(data);
      handleClickOpenDelete();
     
    }

    const handleViewTemplateImage=(data)=>{
      setShopTemplateObject(data);
      handleClickopenViewTemplate();
      
      
    }


    useEffect(()=>{

      if(Object.keys(giftNoteSettingsData).length >0){

        setEnableGiftNotes(giftNoteSettingsData?.enable_gift_notes || false);
        setEnableVideoMessages(giftNoteSettingsData?.enable_video_messages || false);
        setApplyServiceCharge(giftNoteSettingsData?.apply_service_charge || false);
        setEnableDeliveryDate(giftNoteSettingsData?.enable_delivery_date || false);
        const finalVideoLength = giftNoteSettingsData?.max_video_length/60 || "";
        setFormData({
              maxVideoLength: String(finalVideoLength) || "",
              maxMessageLength: String(giftNoteSettingsData?.max_message_length) || "",
              serviceChargePhysicalDelivery: String(giftNoteSettingsData?.service_charge_for_physical_delivery) || "",
              serviceChargeVirtualDelivery: String(giftNoteSettingsData?.service_charge_for_virtual_delivery) || "",
        })

      }
      
     

    },[giftNoteSettingsData]);


    const handleFormChange =(e)=>{
      const {name, value}= e.target;
      let updatedValue = "";
      if(name==="maxVideoLength"){
        // decimal okay
         updatedValue = (value && value.trim()!=="") ?!isNaN(value)? (Number(value)>=0 && Number(value)<=10) ?value.replace(/\s+/g, ""):formData[name]:formData[name]:"";
      }else{
         updatedValue = (value && value.trim()!=="") ?!isNaN(value)? Number(value)>=0?parseInt(value,10):formData[name]:formData[name]:""; 
      }
      setFormData((prevState)=>{
         return {...prevState, [name]: String(updatedValue)}
      })

    }

    const checkNumberValidity = (value)=>{
       if(value && value.trim()!==""){
          if(!isNaN(value)){
              return true;
          }else{
            return false;
          }
       }else{
        return false;
       }
    }


    const handleSaveSettings = async()=>{
      const {
        maxVideoLength,
        maxMessageLength,
        serviceChargePhysicalDelivery,
        serviceChargeVirtualDelivery,
      } = formData;

      const maximumVideoLength = checkNumberValidity(maxVideoLength)?parseFloat(maxVideoLength):0;
      const finalMaximumVideoLength = maximumVideoLength*60;
      const roundedValue = Math.ceil(finalMaximumVideoLength);
      // roundedValue is how many seconds the video can be

      const payload = {
        service_charge_for_physical_delivery: checkNumberValidity(serviceChargePhysicalDelivery)?parseInt(serviceChargePhysicalDelivery,10):0,
        service_charge_for_virtual_delivery: checkNumberValidity(serviceChargeVirtualDelivery)?parseInt(serviceChargeVirtualDelivery,10):0,
        max_video_length: roundedValue,
        max_message_length: checkNumberValidity(maxMessageLength)?parseInt(maxMessageLength,10):0,
        enable_gift_notes: enableGiftNotes,
        enable_video_messages: enableVideoMessages,
        apply_service_charge: applyServiceCharge,
        enable_delivery_date: enableDeliveryDate,
        shop_identifier: token,
      }

      console.log(payload);
      const response = await createOrUpdateSettings(payload);
      if(response.status === 200){
        await fetchSettingsAPI(token);
        setSaveSettingsMessage("Settings saved successfully");
        
      }else{
        setSaveSettingsMessage("Failed to save settings");
      }

      setTimeout(() => {
        setSaveSettingsMessage("");
      }, 4000);
       
    }


    useEffect(() => {
        console.log("Token:", token); // Log token when page loads
        fetchShopTemplates(token);
        fetchSettingsAPI(token);
      }, [token]);

      

    const handleEnableGiftNotes = (e) => {
        setEnableGiftNotes(e.target.checked);
    };

    const handleEnableVideoMessages= (e) => {
        setEnableVideoMessages(e.target.checked);
    };

    const handleApplyServiceCharge= (e) => {
        setApplyServiceCharge(e.target.checked);
    };

    const handleEnableDeliveryDate= (e) => {
        setEnableDeliveryDate(e.target.checked);
    };



    const handleFileChange = async(event) => {
        setUploadedFiles([]);
        setIsTemplateUploading(true);
        // Get the FileList from the input element
        const selectedFiles = Array.from(event.target.files);
        setSelectedFilesLength(selectedFiles.length);

        for(const file of selectedFiles){
          setIsTemplateUploading(true);
            const currentTimeMillis = new Date().getTime();
            const fileName = `${file.name}-${nanoid()}-${currentTimeMillis}`;
            const filePath = `templates/${fileName}`;
            const uploadResponse = await uploadFileToFirebase(file, filePath, token);
            if(uploadResponse.status === 200){
              fetchShopTemplates(token);
                setUploadedFiles((prevState)=>{
                     return [...prevState, uploadResponse.data]
                })
            }
        }
        await fetchShopTemplates(token);
        setUploadedFiles([]);
        setSelectedFilesLength(0);
        setIsTemplateUploading(false);
       
      };

      const handleUpdateTemplateStatus = async(templateId)=>{
        const payload = {
          id: templateId
        }
        const response = await updateShopTemplateStatus(payload);
        if(response.status === 200){
          await fetchShopTemplates(token);
        }
      }

  const triggerShopTemplateDeleteAPI = async()=>{
    const payload = {
      id: shopTemplateObject.id
    }
    const response = await deleteShopTemplateAPI(payload);
    if(response.status === 200){
       await fetchShopTemplates(token);
       handleCloseDelete();
    }else{
      console.log("Failed to delete shop template");
    }
  }


  const openImageInNewTab = () => {
    if (shopTemplateObject?.upload?.url) {
      if(typeof window !== "undefined"){
        window.open(shopTemplateObject.upload.url, "_blank");
      }
    }
  };


  const openImageInNewTab2 = (url) => {
    if (url) {
      if(typeof window !== "undefined"){
        window.open(url, "_blank");
      }
    }
  };


  
      
 
  return (
    <>
    <div className='w-full flex flex-col gap-1 border border-gray-300 rounded-lg p-4'>
              <span className='text-center w-full text-lg font-bold'>
                      🎁 Gift Note & Video Message Settings
              </span>
              <span className='w-full text-sm font-bold'>
                   Customize Your Gift Experience
              </span>

              <span className='w-full text-sm font-bold text-gray-600'>
              Welcome to the Gift Note & Video Message App Configuration! Here, you can customize how your store handles gift notes and personalized video messages.
              </span>

              <div className='w-full flex flex-col gap-1 mt-4'>
                    
                    <section>
                    <Checkbox checked={enableGiftNotes} onChange={handleEnableGiftNotes}>
                             Enable gift notes for customers.
                    </Checkbox>
                    </section>

                    <section className='flex flex-col gap-1'>
                        <Checkbox checked={enableVideoMessages} onChange={handleEnableVideoMessages}>
                                Allow customers to record a video message.
                        </Checkbox>
                        
                      {enableVideoMessages &&  
                      <div style={{marginLeft: "1.6rem"}}  className='flex items-center gap-1'>
                        <span className='text-sm text-gray-600'>-</span>
                        <input
                            type="text"
                            name="maxVideoLength"
                            value={formData.maxVideoLength}
                            onChange={handleFormChange}
                            placeholder=""
                            className="px-2  border border-gray-300 w-[60px]
                            rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 
                            outline-none text-xs text-gray-600 transition-all"
                          />
                          <span className='text-xs text-gray-600'>Max video length (in minutes)</span>

                        </div>}
                      

                    </section>


                    <section className='flex flex-col gap-1'>
                    <Checkbox checked={applyServiceCharge} onChange={handleApplyServiceCharge}>
                             Apply service charge for gift note.
                    </Checkbox>

                    {applyServiceCharge &&  
                    <div style={{marginLeft: "1.6rem"}}  className='flex items-center gap-1'>
                        <span className='text-sm text-gray-600'>-</span>
                        <input
                            type="text"
                            placeholder=""
                            name="serviceChargePhysicalDelivery"
                            value={formData.serviceChargePhysicalDelivery}
                            onChange={handleFormChange}
                            className="px-2  border border-gray-300 w-[60px]
                            rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 
                            outline-none text-xs text-gray-600 transition-all"
                          />
                          <span className='text-xs text-gray-600'>Service charge for physical delivery</span>

                        </div>}


                        {applyServiceCharge &&  
                    <div style={{marginLeft: "1.6rem"}}  className='flex items-center gap-1'>
                        <span className='text-sm text-gray-600'>-</span>
                        <input
                            type="text"
                            placeholder=""
                            name="serviceChargeVirtualDelivery"
                            value={formData.serviceChargeVirtualDelivery}
                            onChange={handleFormChange}
                            className="px-2  border border-gray-300 w-[60px]
                            rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 
                            outline-none text-xs text-gray-600 transition-all"
                          />
                          <span className='text-xs text-gray-600'>Service charge for virtual delivery</span>

                        </div>}


                    </section>

                    <section className='flex flex-col gap-1'>
                    <Checkbox checked={true}  >
                             Enable gift note text message.
                    </Checkbox>


                   <div style={{marginLeft: "1.6rem"}}  className='flex items-center gap-1'>
                        <span className='text-sm text-gray-600'>-</span>
                        <input
                            type="text"
                            placeholder=""
                            name="maxMessageLength"
                            value={formData.maxMessageLength}
                            onChange={handleFormChange}
                            className="px-2  border border-gray-300 w-[60px]
                            rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 
                            outline-none  transition-all text-xs text-gray-600"
                          />
                          <span className='text-xs text-gray-600'>Max message length</span>

                        </div>



                    </section>

                    <section>
                    <Checkbox checked={enableDeliveryDate} onChange={handleEnableDeliveryDate} >
                            Enable a delivery date.
                    </Checkbox>
                    </section>

               {saveSettingsStatus==="success" && saveSettingsMessage &&  
                    <section className='text-xs font-bold text-[#0bad05] tracking-[0.5px]'>
                           {saveSettingsMessage}
                    </section>}


                    {saveSettingsStatus==="error" && saveSettingsMessage &&  
                    <section className='text-xs font-bold text-[#ff1803] tracking-[0.5px]'>
                           {saveSettingsMessage}
                    </section>}


                    <section>
                      <button disabled={isSavingSettings}  onClick={handleSaveSettings} 
                      className={`save-settings-button ${isSavingSettings?"opacity-50 cursor-not-allowed":""}`}>
                        {isSavingSettings ? "SAVING..." : "SAVE SETTINGS"}
                        </button>
                    </section>

                    <section className='w-full border border-gray-200 rounded-lg mt-5'>

                    </section>


                     <section className='text-xs font-bold text-[#fc1900] text-center w-full'>
                            *Only templates that are activated will be visible to customers during checkout.
                     </section>

                    <section className='w-full flex items-center justify-center'>
                    <label htmlFor="file-upload" className={`custom-file-upload ${(isTemplateUploading || isUploading) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                                { (isTemplateUploading || isUploading) ? "UPLOADING..." : "CHOOSE TEMPLATES"}
                            </label>
                    <input disabled={isUploading || isTemplateUploading} id="file-upload" type="file" multiple accept="image/*" 
                     onChange={handleFileChange} />
                    </section>

                 {uploadedFiles.length> 0 && selectedFilesLength > 1 &&
                    <section className='text-xs text-gray-600 text-center w-full'>
                           {uploadedFiles.length} template{uploadedFiles.length > 1 ? "s" : ""} {uploadedFiles.length > 1 ? "were" : "was"} successfully uploaded out of a total of {selectedFilesLength}.
                    </section>}

                  {uploadedFiles.length>0 && 
                   selectedFilesLength ===1 &&
                     <section className='text-xs text-gray-600 text-center w-full'>
                         Template uploaded successfully.
                    </section>}




                    <section className='w-full template-container gap-2 mt-2'>
    {shopTemplateData.map((item, index) => {
        return (
            <div key={index} style={{ boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px" }} 
                 className='flex flex-col  rounded-lg border border-gray-300 cursor-pointer p-1'>




                <div onClick={()=>openImageInNewTab2(item.upload.url)} 
                className="relative w-full flex justify-center">
                    <img src={item.upload.url} alt={item.upload.file_name} 
                         className={`uploaded-file-image`} />
                   {!item.is_active && 
                   <div className="absolute inset-0 bg-gray-500 opacity-80 rounded-lg flex items-center justify-center">
                    
                    <span className="text-white font-bold text-2xl uppercase transform rotate-[-45deg]">
                INACTIVE
            </span>
                    </div>}
                </div>




                <section className="w-full flex items-center gap-2 justify-center">
                    <span onClick={()=>handleViewTemplateImage(item)} className='text-[#2678fc] cursor-pointer'><PreviewIcon sx={{ fontSize: 20 }} /></span>
                    <span onClick={()=>handleUpdateTemplateStatus(item.id)} className={` cursor-pointer ${item.is_active ? "text-[#05b534]":"text-gray-600"}`}><PowerSettingsNewIcon sx={{ fontSize: 20 }} /></span>
                    <span onClick={()=>handleTemplateDeleteClick(item)} className='text-[#ff0318] cursor-pointer'><DeleteIcon sx={{ fontSize: 20 }} /></span>
                </section>
            </div>
        );
    })}
</section>



                    
                     

                    
              </div>
    </div>



 {openDelete &&
    <Dialog
        open={openDelete}
        onClose={handleCloseDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
       
        <DialogContent>
      
<div className="flex items-center justify-center bg-gray-200">
   
    <div className="bg-white rounded-lg  p-4">
     
        <h2 className="text-lg font-semibold text-gray-800">Confirm Deletion</h2>
        
      
        <p className="text-gray-600  text-sm">
            Are you sure you want to delete this template? This action cannot be undone.
        </p>

        <div className={`w-full mt-2`}>
            
       

          <img style={{boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px"}} 
            src={shopTemplateObject?.upload?.url} alt={shopTemplateObject?.upload?.file_name} 
             className={`rounded-lg object-cover w-full 
            `}
            />

        </div>
        
      
        <div className="mt-6 flex justify-end space-x-3">
            <button onClick={handleCloseDelete} className="cursor-pointer px-4 py-[6px] tracking-[0.5px] bg-gray-300 text-gray-700 text-xs rounded-md hover:bg-gray-400">
                CANCEL
            </button>
            <button disabled={isDeletingShopTemplate} onClick={triggerShopTemplateDeleteAPI} className="cursor-pointer px-4 py-[6px] tracking-[0.5px] bg-red-600 text-xs text-white rounded-md hover:bg-red-700">
                {isDeletingShopTemplate ? "DELETING..." : "DELETE"}
            </button>
        </div>
    </div>
</div>

        </DialogContent>
    
      </Dialog>}



     {openViewTemplate &&
      <Dialog
        open={openViewTemplate}
        onClose={handleCloseopenViewTemplate}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
       
        <DialogContent>
      
        <div className={`w-full  min-w-[400px] min-h-[300px]`}>
     
      <img
      onClick={openImageInNewTab}
        src={shopTemplateObject?.upload?.url}
        alt={shopTemplateObject?.upload?.file_name}
        className={`rounded-lg cursor-pointer object-cover w-full`}
        
      />
    </div>

        </DialogContent>
    
      </Dialog>}


    </>
  )
}

export default GiftNote;