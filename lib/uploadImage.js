const fetch = require('node-fetch');

const FormData = require('form-data');

const { fromBuffer } = require('file-type');

/**

* Upload image to url

* Supported mimetype:

* - `image/jpeg`

* - `image/jpg`

* - `image/png`

* - `video/mp4`

* - `all files`

* @param {Buffer} buffer Image Buffer

*/

module.exports = async (buffer) => {

  let { ext } = await fromBuffer(buffer);

  const bodyForm = new FormData();

  bodyForm.append("file", buffer, "file." + ext);

  

  const response = await fetch("https://file.idnet.my.id/api/upload.php", {

    method: "POST",

    body: bodyForm,

  });

  const result = await response.json();

  return result.file.url;

}