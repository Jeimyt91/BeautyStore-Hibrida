import { Camera, CameraSource, CameraResultType } from '@capacitor/camera';

export async function choosePhoto() {
  const photo = await Camera.getPhoto({
    source: CameraSource.Prompt,
    resultType: CameraResultType.DataUrl,
    quality: 65,
    width: 480,
    height: 480,
    correctOrientation: true
  });
  if (!photo.dataUrl) throw new Error('No se recibió ninguna imagen.');
  return await shrinkImage(photo.dataUrl);
}

export async function shrinkImage(dataUrl) {
  return await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const size = 320, ratio = Math.min(size / img.width, size / img.height, 1);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.65));
    };
    img.onerror = () => reject(new Error('No se pudo procesar la fotografía.'));
    img.src = dataUrl;
  });
}
