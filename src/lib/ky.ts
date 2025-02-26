import ky from "ky"
const kyInstance = ky.create({
    prefixUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/",
    parseJson(text) {
        return JSON.parse(text, (key, value) => {
            if(key.endsWith("At")) return new Date(value);
            return value;
        })
    }
})

export default kyInstance;