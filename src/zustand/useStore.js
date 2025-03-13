import { create } from 'zustand';
import axios from 'axios';

export const useStore = create((set) => ({
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
  updateBears: (newBears) => set({ bears: newBears }),
  isUploading: false,
  fetchShopTemplatesLoading: false,
  isDeletingShopTemplate: false,
  isUploadingVideo: false,
  shopTemplateData: [],
  isSavingSettings: false,
  giftNoteSettingsData: {},
  saveSettingsStatus:"",
  shopTemplatePagination: {
    currentPage: 1,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
    isFirst: true,
    isLast: true,
  },

  uploadFileToFirebase: async (file, filePath, shopIdentifier) => {
       set({isUploading: true});
    try{

        const formData = new FormData();
        formData.append('file', file);
        formData.append('filePath', filePath);
        formData.append('shopIdentifier', shopIdentifier);
    const response = await axios.post('/api/upload', formData,  {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    set({isUploading: false});

    if(response.status === 200){
        return response;
    }else{
       return {message: 'Failed to upload file to Firebase', status: 400};
    }

    }catch(error){
        set({isUploading: false});
        console.error('Error uploading file to Firebase:', error);
        return {message: 'Failed to upload file to Firebase', status: 500};
        
    }
  },

  fetchShopTemplates: async (shopIdentifier, page = 1, size = 100) => {
    set({fetchShopTemplatesLoading: true});
    try{
       const response = await axios.get(`/api/template/${shopIdentifier}?page=${page}&size=${size}`);
       set({fetchShopTemplatesLoading: false,
        shopTemplateData: response.data.content,
        shopTemplatePagination: response.data.pagination
       });
    
    }catch(error){
      set({fetchShopTemplatesLoading: false,
        shopTemplateData: [],
        shopTemplatePagination: {
          currentPage: 1,
          pageSize: 10,
          totalElements: 0,
          totalPages: 0,
          isFirst: true,
          isLast: true,
        }
      });
      console.error('Error fetching shop templates:', error);
      return {message: 'Failed to fetch shop templates', status: 500};
    }
  },


  createOrUpdateSettings:async(payload)=>{
        set({isSavingSettings: true,
            saveSettingsStatus: "loading",
        });
        try{
           const response = await axios.post('/api/settings', payload);
           set({isSavingSettings: false,
            saveSettingsStatus: "success",
           });
           return response;
        }catch(error){
          set({isSavingSettings: false,
            saveSettingsStatus: "error",
          });
          console.error('Error creating or updating settings:', error);
          return {message: 'Failed to create or update settings', status: 500};
        }
  },

  fetchSettingsAPI: async(shopIdentifier)=>{
     
     try{
      const response = await axios.get(`/api/settings/${shopIdentifier}`);
       set({giftNoteSettingsData: response.data});
     }catch(error){
      console.error('Error fetching settings:', error);
      return {message: 'Failed to fetch settings', status: 500};
     }
  },

  updateShopTemplateStatus: async(payload)=>{

    try{
      const response = await axios.post('/api/template/update-status', payload);
      return response;
    }catch(error){
      return {message: 'Failed to update shop template status', status: 500};
    }
  },

  deleteShopTemplateAPI: async(payload)=>{
    set({isDeletingShopTemplate: true});
    try{
      const response = await axios.post('/api/template/delete', payload);
      set({isDeletingShopTemplate: false});
      return response;
    }catch(error){
      set({isDeletingShopTemplate: false});
      return {message: 'Failed to delete shop template', status: 500};
    }
  },
   
  uploadVideoToFirebaseAPI: async(payload)=>{
     set({isUploadingVideo: true});
     try{
       const response = await axios.post('/api/upload/video', payload);
       set({isUploadingVideo: false});
       return response;
     }catch(error){
      set({isUploadingVideo: false});
      return {message: 'Failed to upload video to Firebase', status: 500};
     }
  }


}))
