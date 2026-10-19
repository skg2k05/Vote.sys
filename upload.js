export default function uploadImage(file) {
	return new Promise((resolve, reject) => {
		const reader = new window.FileReader();
		reader.onloadend = async () => {
			try {
				const response = await fetch('/upload', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ image: reader.result }),
				});
				const json = await response.json();
				if (json.status === 'success') resolve(json.data.hash);
				else reject(new Error(json.message));
			} catch (err) {
				reject(err);
			}
		};
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}
