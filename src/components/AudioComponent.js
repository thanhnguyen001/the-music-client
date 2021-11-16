import React, { forwardRef} from 'react'

function Audio(props, ref) {

    return (
        <audio src="" id="audio2" ref={ref}></audio>
    )
}

export default forwardRef(Audio);
