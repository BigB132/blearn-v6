function logout() {
    window.location = "/auth/logout"
}

document.getElementById("logout").addEventListener("click", logout);