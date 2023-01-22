const loginInput = document.getElementById('login');
const passwordInput = document.getElementById('password');
const signinButton = document.getElementById('signin');
const signupButton = document.getElementById('signup');
const authForm = document.getElementById('auth_form');

const handleSignin = () => {
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
            localStorage.setItem('userName', loginInput.value);
            authForm.style.visibility = 'hidden';
            location.reload();
        })
        .catch(error => alert(error.message));
}

signinButton.addEventListener('click', handleSignin);

signupButton.addEventListener('click', () => {
    fetch('http://localhost:3000/api/signup', {
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
            handleSignin();

        })
        .catch(error => alert(error.message));
})