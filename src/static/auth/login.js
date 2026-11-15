async function login() {
    console.log('Sending request')
    try {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })

        if (response.ok) {
            window.location = "/dashboard"
        }
    } catch (err) {
        console.log('Failed sending request to server:', err)
    }
}

document.getElementById("submit").addEventListener("click", login);