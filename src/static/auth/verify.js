async function verify() {
    console.log('Sending request')

    try {

        const num1 = document.getElementById("num1").value;
        const num2 = document.getElementById("num2").value;
        const num3 = document.getElementById("num3").value;
        const num4 = document.getElementById("num4").value;
        const num5 = document.getElementById("num5").value;
        const num6 = document.getElementById("num6").value;

        const num = num1 + num2 + num3 + num4 + num5 + num6
        console.log(num)

        const response = await fetch("/api/auth/verify", { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: num })
        })

        if (response.ok) {
            window.location = "/dashboard"
        }

    } catch (err) {
        console.log("Failed to send request:", err)
    }

}

const inputs = Array.from(document.getElementsByClassName("num"));

function input(event, element) {
    if (/^[0-9]$/.test(event.target.value)) {
        console.log(inputs.indexOf(element))
        if (inputs.indexOf(element) < 5) {
            inputs[inputs.indexOf(element) + 1].focus();
        } else {
            verify()
        }
    } else {
        event.target.value = ""
    }
}

document.getElementById("submit").addEventListener("click", verify);
Array.from(document.getElementsByClassName("num")).forEach(element => {
    element.addEventListener("input", (event) => input(event, element))
}); 

inputs.forEach((input, idx) => {
    input.addEventListener("keydown", (event) => {
        if (event.key === "Backspace" && input.value === "") {
            inputs[idx - 1].focus();
        }
    })
})
