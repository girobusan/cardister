
const imageSize = [512, 512];

export function killEvent(event) {
    event.stopPropagation();
    event.preventDefault();
}

export async function dataURLFromFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => resolve(/** @type {string} */ (reader.result));
        reader.readAsDataURL(file); 
    });
}

export async function dataTransferToImage(dt) {
    const files = filesFromDataTransfer(dt);
    const element = elementFromDataTransfer(dt);
    if (files.length > 0) {
        return await fileToCompressedImageURL(files[0]);
    } else if (element && element.nodeName === 'IMG') {
        return await compressImageURL(element.src, .2, imageSize);
    }
}


export function filesFromDataTransfer(dataTransfer) {
    const clipboardFiles = 
        Array.from(dataTransfer.items || [])
        .filter(item => item.kind === 'file')
        .map(item => item.getAsFile());
    return clipboardFiles.concat(...(dataTransfer.files || []));
}


export function elementFromDataTransfer(dataTransfer) {
    const html = dataTransfer.getData('text/html');
    return html && stringToElement(html);
}

export async function fileToCompressedImageURL(file) {
    const url = await dataURLFromFile(file);
    const dataURL = await compressImageURL(url, 0.2, imageSize);
    return dataURL;
}


export async function compressImageURL(url, quality, size) {
    const image = document.createElement("img");
    image.crossOrigin = "true";
    const canvas = document.createElement("canvas");

    const [tw, th] = size;
    canvas.width = tw;
    canvas.height = th;

    return new Promise((resolve, reject) => {
        image.onload = () => {
          if(image.width>tw || image.height>th){
            var scale = Math.min(tw / image.width, th / image.height);

          }else{
            scale = 1;
          }
          canvas.width = image.width * scale;
          canvas.height = image.height * scale;
          const context = canvas.getContext('2d');
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          const url = canvas.toDataURL('image/jpeg', quality);

          resolve(url);
        };
        image.onerror = () => resolve(undefined);
        image.src = url;
    });
}

