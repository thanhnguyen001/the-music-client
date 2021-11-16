
import { useEffect, useState } from 'react'

function getDimension() {
    const { innerWidth, innerHeight } = window;
    return {
        height: innerHeight,
        width: innerWidth
    }
}

function useDimensionWindow() {

    const [dimension, setDimension] = useState(getDimension());

    useEffect(() => {

        const handleResize = () => {
            setDimension(getDimension());
        }

        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize); 

    }, [])
    
    return dimension;
}

export default useDimensionWindow
