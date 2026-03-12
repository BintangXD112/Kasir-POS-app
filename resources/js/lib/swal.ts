import Swal from "sweetalert2";

const isDarkMode = () => {
    return document.documentElement.classList.contains("dark");
};

export const ThemedSwal = Swal.mixin({
    background: isDarkMode() ? "#18181b" : "#ffffff",
    color: isDarkMode() ? "#f4f4f5" : "#18181b",
    confirmButtonColor: "#059669",
    cancelButtonColor: "#6b7280",
});
