const loginInput = document.getElementById('login');
const passwordInput = document.getElementById('password');
const signinButton = document.getElementById('signin');
const signupButton = document.getElementById('singup');
const authForm = document.getElementById('auth_form');

signinButton.addEventListener('click', () => {
    fetch('http://localhost:3000/api/signin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
            login: loginInput.value,
            password: passwordInput.value
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                return;
            }
            localStorage.setItem('token', data.token);
            authForm.style.visibility = 'hidden';
            location.reload();
        })
        .catch(error => alert(error.message));
})