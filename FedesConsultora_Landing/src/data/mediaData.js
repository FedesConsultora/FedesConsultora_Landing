// src/data/mediaData.js

// Import images
import img1 from '../assets/img/galeria/imagenes/img1.webp';
import img2 from '../assets/img/galeria/imagenes/img2.webp';
import img3 from '../assets/img/galeria/imagenes/img3.webp';
import img4 from '../assets/img/galeria/imagenes/img4.webp';
import img5 from '../assets/img/galeria/imagenes/img5.webp';
import img6 from '../assets/img/galeria/imagenes/img6.webp';
import img7 from '../assets/img/galeria/imagenes/img7.webp';
import img8 from '../assets/img/galeria/imagenes/img8.webp';
import img9 from '../assets/img/galeria/imagenes/img9.webp';
import img10 from '../assets/img/galeria/imagenes/img10.webp';
import img11 from '../assets/img/galeria/imagenes/img11.webp';
import img12 from '../assets/img/galeria/imagenes/img12.webp';
import img13 from '../assets/img/galeria/imagenes/img13.webp';
import img14 from '../assets/img/galeria/imagenes/img14.webp';

// Import videos
import vid1mp4 from '../assets/img/galeria/videos/vid1.mp4';
import vid1webm from '../assets/img/galeria/videos/vid1.webm';
import vid1poster from '../assets/img/galeria/videos/vid1_poster.jpg';
import vid2mp4 from '../assets/img/galeria/videos/vid2.mp4';
import vid2webm from '../assets/img/galeria/videos/vid2.webm';
import vid2poster from '../assets/img/galeria/videos/vid2_poster.jpg';
import vid3mp4 from '../assets/img/galeria/videos/vid3.mp4';
import vid3webm from '../assets/img/galeria/videos/vid3.webm';
import vid3poster from '../assets/img/galeria/videos/vid3_poster.jpg';
import vid4mp4 from '../assets/img/galeria/videos/vid4.mp4';
import vid4webm from '../assets/img/galeria/videos/vid4.webm';
import vid4poster from '../assets/img/galeria/videos/vid4_poster.webp';

export const allMediaData = [
    { src: img1, category: 'producciones', type: 'image' },
    { src: img2, category: 'none', type: 'image' },
    {
        src: vid1mp4,
        webm: vid1webm,
        poster: vid1poster,
        category: 'producciones',
        type: 'video'
    },
    { src: img3, category: 'none', type: 'image' },
    { src: img4, category: 'none', type: 'image' },
    { src: img5, category: 'none', type: 'image' },
    {
        src: vid2mp4,
        webm: vid2webm,
        poster: vid2poster,
        category: 'producciones',
        type: 'video'
    },
    { src: img6, category: 'none', type: 'image' },
    { src: img7, category: 'none', type: 'image' },
    { src: img8, category: 'none', type: 'image' },
    {
        src: vid4mp4,
        webm: vid4webm,
        poster: vid4poster,
        category: 'none',
        type: 'video'
    },
    {
        src: vid3mp4,
        webm: vid3webm,
        poster: vid3poster,
        category: 'producciones',
        type: 'video'
    },
    { src: img9, category: 'none', type: 'image' },
    { src: img10, category: 'none', type: 'image' },
    { src: img11, category: 'none', type: 'image' },
    { src: img12, category: 'none', type: 'image' },
    { src: img13, category: 'producciones', type: 'image' },
    { src: img14, category: 'producciones', type: 'image' },
];

export const categories = [
    { id: 'todo', label: 'Todo' },
    { id: 'testimonios', label: 'Testimonios (Próximamente)' },
    { id: 'producciones', label: 'Producciones' }
];
