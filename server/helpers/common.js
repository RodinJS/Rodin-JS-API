import fs from 'fs';


function getUserNameFromEmail(email) {
  const reMatch = /^([^@]*)@/;
  return email.match(reMatch)[1].replace(/[^0-9a-z]/gi, '');

}

function generateCode(codeLength) {
  codeLength = codeLength || 5;
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < codeLength; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function getDefTemplatesObject() {
  const defTemplates = fs.readFileSync('templatesImport.json', 'utf8');
  return JSON.parse(defTemplates);
}

function byteToMb(num) {
  return parseFloat((num / 1024 / 1024).toFixed(2))
}

function convertDate() {
/*  const monthNames = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
  ];*/

  const date = new Date();
  const day = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear();

  return (monthIndex + 1) + ' / ' + day + ' / ' + year;
}

function deleteFolderRecursive(path) {
  fs.readdirSync(path).forEach((file) => {
    let curPath = path + "/" + file;
    if (fs.lstatSync(curPath).isDirectory()) { // recurse
      deleteFolderRecursive(curPath);
    }
    else { // delete file
      fs.unlinkSync(curPath);
    }
  });
  fs.rmdirSync(path);
}


export default {
  generateCode,
  getDefTemplatesObject,
  byteToMb,
  getUserNameFromEmail,
  convertDate,
  deleteFolderRecursive
};
