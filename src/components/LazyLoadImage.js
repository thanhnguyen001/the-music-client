import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';


const LazyLoad = ({ src, threshold }) => (
    <LazyLoadImage
        alt=""
        effect="blur"
        src={src}
        threshold={threshold || 100}
    />
);

export default LazyLoad