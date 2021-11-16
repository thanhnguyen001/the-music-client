export function UtilChangeToAlpha(letter) {
    letter = letter
        .toLowerCase()
        .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
        .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
        .replace(/ì|í|ị|ỉ|ĩ/g, "i")
        .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
        .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
        .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
        .replace(/đ/g, "d")
        .replace(/\s+/g, "-") // Replace space = '-'
        .replace(/[^A-Za-z0-9_-]/g, "-") // Replace not number and not a-z, A-Z to "";
        // .replace(/-+/g, "-");    // Replace -
    return letter;
}

export function animationFly(content, cd) {
    const rect = cd.getBoundingClientRect();
        const bottom = {
            top: content.clientHeight - rect.bottom,
            right: content.clientWidth - rect.right + 240
        }
        cd.style.zIndex = 1200;
        cd.animate([
            {
                top: 0,
                right: 0,
                opacity: 1,
                transform: "scale(1.5)",
            },
            {
                top: "-60px",
                right: "-60px",
                opacity: 0.8,
                transform: "scale(1.2)",
            },
            {
                top: "-60px",
                right: "-100px",
                opacity: 0.6,
                transform: "scale(1.2)",
            },
            {
                top: "-60px",
                right: "-150px",
                opacity: 0.6,
                transform: "scale(1)",
            },
            {
                top: `${bottom.top - 100}px`,
                right: `-${bottom.right - 100}px`,
                opacity: 0.5,
                transform: "scale(1)",
            },
            {
                top: `${bottom.top}px`,
                right: `-${bottom.right}px`,
                opacity: 0,
                transform: "scale(1)",
            }
        ], {
            duration: 1000,
            easing: "linear"
        });
}