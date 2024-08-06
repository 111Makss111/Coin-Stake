document.addEventListener('DOMContentLoaded', function() {
    // Обробка кнопки реєстрації
    const registerButton = document.getElementById('registerButton');
    const loginButton = document.getElementById('loginButton');
    const userForm = document.getElementById('userForm');
    
    registerButton.addEventListener('click', async () => {
        const formData = new FormData(userForm);
        const data = {
            username: formData.get('username'),
            email: formData.get('email'),
            password: formData.get('password')
        };

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert('Registration successful!');
                userForm.reset(); // Очищення форми
            } else {
                alert('Registration failed!');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Registration failed!');
        }
    });

    // Обробка кнопки логування
    loginButton.addEventListener('click', async () => {
        const formData = new FormData(userForm);
        const data = {
            username: formData.get('username'),
            password: formData.get('password')
        };

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert('Login successful!');
                userForm.reset(); // Очищення форми
            } else {
                alert('Login failed!');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Login failed!');
        }
    });

    // Обробка модальних вікон
    const modal = document.getElementById("modal");
    const boostButton = document.getElementById("boostButton");
    const closeModalButton = document.getElementsByClassName("close")[0];
    const backButton = document.getElementById("backButton");

    boostButton.onclick = () => {
        modal.style.display = "block";
    }

    closeModalButton.onclick = () => {
        modal.style.display = "none";
    }

    backButton.onclick = () => {
        modal.style.display = "none";
    }
    
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    }

    // Обробка другого модального вікна
    const sendModal = document.getElementById("sendModal");
    const sendBtn = document.querySelector(".button-send");
    const sendClose = sendModal.querySelector(".close");

    sendBtn.onclick = () => {
        sendModal.style.display = "block";
    }

    sendClose.onclick = () => {
        sendModal.style.display = "none";
    }

    window.onclick = (event) => {
        if (event.target === sendModal) {
            sendModal.style.display = "none";
        }
    }

    // Анімація для елемента з ID 'fan'
    const fan = document.getElementById('fan');
    if (fan) {
        fan.addEventListener('click', () => {
            fan.style.animationDuration = '1s';
            setTimeout(() => {
                fan.style.animationDuration = '2s';
            }, 1000);
        });
    }

    // Оновлення лічильника
    const counterElement = document.getElementById('trx-counter');
    let currentValue = 0;
    const incrementRate = 1.0; // 1 GH/s
    const updateInterval = 1000; // 1000 ms = 1 second

    function updateCounter() {
        currentValue += incrementRate / 1_000_000; 
        if (counterElement) {
            counterElement.textContent = currentValue.toFixed(6) + ' TRX';
        }
    }

    setInterval(updateCounter, updateInterval);

    // Обробка кнопок у footer
    document.querySelectorAll('.button').forEach(button => {
        button.addEventListener('click', () => {
            alert(button.textContent + ' clicked');
        });
    });

    document.querySelectorAll('.footer-button').forEach(button => {
        button.addEventListener('click', () => {
            alert(button.querySelector('svg use').getAttribute('href').split('#')[1] + ' clicked');
        });
    });
});
document.getElementById('name-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    fetch('/save-name', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: name })
    }).then(response => response.text()).then(data => {
        alert(data);
    });
});