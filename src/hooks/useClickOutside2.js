import { useEffect } from 'react'

function useClickOutSide2(ref, index) {

    useEffect(() => {
        const handleClickOutSide = (e) => {
            if (ref.current && (!ref.current.contains(e.target))) {
                if (e.target.closest(`#song-${index}`)) return;
                if (e.target.className === "fas fa-ellipsis-h log-out-dots") return;
                ref.current.classList.remove("active");
            }
        }
        document.addEventListener("mousedown", handleClickOutSide);

        return () => document.removeEventListener("mousedown", handleClickOutSide)

    }, [index, ref])

}

export default useClickOutSide2
