import fs from 'fs';
import path from 'path';


export const createFolderIfNotExists = (folderPath) => {



  if (!fs.existsSync(resolvedPath)) {
    try {
      fs.mkdirSync(resolvedPath, { recursive: true });
      console.log(`Folder created: ${resolvedPath}`);
    } catch (err) {
      console.error(`Error creating folder: ${resolvedPath}`, err);
    }
  } else {
    console.log(`Folder already exists: ${resolvedPath}`);
  }
};


