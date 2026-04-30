let swal = null;
let swalInstance = null;

const getSwal = async () => {
	if (!swalInstance) {
		if (!swal) {
			swal = import("sweetalert2/dist/sweetalert2.js").then(
				(module) => module.default
			);
		}
		swalInstance = await swal;
	}
	return swalInstance;
};

export {
	getSwal
};