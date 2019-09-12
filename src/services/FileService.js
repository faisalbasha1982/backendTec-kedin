/**
 * Copyright (C) 2017 TopCoder Inc., All Rights Reserved.
 */
/**
 * the file service
 * @author      TSCCODER
 * @version     1.0
 */


const path = require('path');
const helper = require('../common/helper');


/**
 * upload a file , save it to config.IMAGES_PATH
 * and create file entity,return it
 * @param baseDir the IMAGES_PATH
 * @param subDir the sub dir
 * @param file the file entity
 * @return string object
 */
function* upload(baseDir, subDir, file) {
  const newFileName = `${helper.randomStr(6)}-${new Date().getTime()}-${file.name}`;
  file.mv(path.join(baseDir, subDir, newFileName));
  return newFileName;
}

module.exports = {
  upload,
};

