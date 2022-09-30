import path from "path";
import fs from "fs";
import sharp from "sharp";

const DIR = "images";
const files = fs.readdirSync(DIR);
console.log(files);

// const kind = "cover";
const kind = "contain";
// const kind = "fill";
// const kind = "inside";
// const kind = "outside";

files.forEach(async (file) => {
  const path = `${DIR}/${file}`;
  const { height, width } = await sharp(path).metadata();
  const options = {
    fit: kind,
    width: 2 ** Math.floor(Math.log(width) / Math.log(2)),
    height: 2 ** Math.floor(Math.log(height) / Math.log(2)),
  }
  await convertToType(path, "webp", options , "-" + kind);
  await convertToType(path, "avif", options , "-" + kind);
});

/**
 * @param {*} image - image
 * @param {'avif' | 'webp' | 'jpeg'} type - output type
 */
async function convertToType(
  imagePath,
  type = "webp",
  resizeOptions,
  suffix = "",
) {
  if (!imagePath) {
    throw "imagePath is not defined";
  }
  const [folder, name_with_extension] = imagePath.split("/");
  const [name, extension] = name_with_extension.split(".");
  const dir = "./images";
  const imageId = suffix == "" ? name : name + suffix;
  const filePath = path.normalize(`${dir}/${imageId}.${type}`);
  switch (type) {
    case "webp":
      return new Promise((resolve, reject) =>
        sharp(imagePath).webp().resize(resizeOptions).toFile(
          filePath,
          handler(reject, resolve, imageId, filePath),
        )
      );
    case "avif":
      return new Promise((resolve, reject) =>
        sharp(imagePath).avif().resize(resizeOptions).toFile(
          filePath,
          handler(reject, resolve, imageId, filePath),
        )
      );
    case "jpeg":
      return new Promise((resolve, reject) =>
        sharp(imagePath).jpeg().resize(resizeOptions).toFile(
          filePath,
          handler(reject, resolve, imageId, filePath),
        )
      );
    default:
      return new Promise((_resolve, reject) =>
        reject(`Type ${type} is not defined`)
      );
  }
}

function handler(reject, resolve, imageId, filePath) {
  return (err, info) => {
    if (err) {
      console.error(err);
      reject(err);
    }

    console.log({info})
    resolve({ id: imageId, info, filePath });
  };
}
