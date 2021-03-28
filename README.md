# Simple Canvas Gallery

This project was implemented by using jQuery library with Parcel bundler.

## Run the project

To run the project, execute the install command `npm install` and then use the command below to start.

```bash
npm run dev
```

## Demo
Visit [canvas-gallery.vercel.app](https://canvas-gallery.vercel.app/) for demo.

## Concept

The concept of this project is allow users to upload multiple images and add annotation and tagging in those images.

Uploaded images will be stored into `localStorage` and the maximum allowed images size is 1MB.

The images will then be shown in a thumbnail and user will be able to edit the tags or remove image.

## Logic behind

The code written in ES6 and transpile into ES5 using Parcel bundler.

To get files input from user, `<input type="file" accept="image/png, image/jpeg" />` was used to obtain images from user and limit to `png` and `jpeg` files.

The file then will be process using native `FileReader()` and convert the image string into `base64`, each of the image will then store into `image` array and click event was delegate into each images.

When image was clicked, tag will be added by getting the click position of x and y. These info will then be stored into `tags` array with unique ID generated using timestamp.

Upon dragging of the tag, the updated position will be stored to each object inside the `tag` array.

When save button is clicked, the image data will then be stored into `localStorage`.

## Features
- Responsive design
- Dark mode
- List/Grid View toggle
- Remove tags by clearing the text

## Limitation
- Image size is limited to 1MB
- Image type only allows `.png` and `.jpg`
