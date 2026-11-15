async function register() {
    console.log('Sending request')
    try {
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        })

        if (response.ok) {
            window.location = "verify"
        }
    } catch (err) {
        console.log('Failed sending request to server:', err)
    }
}

document.getElementById("submit").addEventListener("click", register);