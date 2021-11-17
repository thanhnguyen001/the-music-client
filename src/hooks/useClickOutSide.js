import { useEffect } from 'react'
import useDimensionWindow from './useDimensionWindow';

function useClickOutSide(ref) {

    const { width: windowWidth } = useDimensionWindow();

    useEffect(() => {
        const handleClickOutSide = (e) => {
            if (windowWidth < 470) {
            
                if (ref.current && (!ref.current.contains(e.target) || e.target.closest(".part1__item") || e.target.closest(".part1__title")) ) {
                    if (e.target.closest(".part1__item") && (e.target.closest(".delete-playlist-menu") || e.target.closest(".sidebar-playlist-menu"))) return;
                    ref.current.style.transform = "translateX(-100%)";
                }
            }
            else return;
        }

        document.addEventListener("mousedown", handleClickOutSide);

        return () => document.removeEventListener("mousedown", handleClickOutSide)

    }, [ref, windowWidth])

}

export default useClickOutSide
