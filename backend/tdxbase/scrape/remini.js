// udah gak work pepek


const axios = require("axios");
const FormData = require("form-data");

async function remini(buffer, method = "enhance") {
	const Methods = ["enhance", "recolor", "dehaze"];
	if (!Methods.includes(method)) method = "enhance";

	const form = new FormData();
	form.append("model_version", 1);
	form.append("image", buffer, {
		filename: "image.jpg",
		contentType: "image/jpeg"
	});

	try {
		const response = await axios.post(
			`https://inferenceengine.vyro.ai/${method}`,
			form,
			{
				headers: {
					...form.getHeaders(),
					"User-Agent": "okhttp/4.9.3"
				},
				responseType: "arraybuffer"
			}
		);

		return Buffer.from(response.data);
	} catch (err) {
		console.error("Remini error:", err.message);
		throw new Error("Gagal memproses gambar di API Vyro.");
	}
}

module.exports = { remini };