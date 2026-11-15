async function logout() {

    try {

        const response = await fetch("/api/auth/logout", {
            method: "POST"
        })

        if (response.ok) {
            window.location = "/"
        } else {
            console.log("Something went wrong while logging out. Check network logs.")
        }

    } catch (err) {
        console.log("Error while logging out:", err)
    }

}

logout()