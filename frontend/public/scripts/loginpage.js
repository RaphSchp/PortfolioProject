document.addEventListener('DOMContentLoaded', function() {
    if (window.location.href.includes('/register')) {
        switchTo('register');
    }
});

// Fonction pour gérer la soumission du formulaire de connexion
function handleLogin() {
    const email = document.getElementById('logEmail').value;
    const password = document.getElementById('logPassword').value;

    if (!email || !password) {
        alert('Please enter both email and password.');
        return;
    }

    // Send data to the server
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Redirect to the main page upon successful login
            window.location.href = '/pages/mainpage.html';
        } else {
            alert('Incorrect email or password.');
        }
    })
    .catch(error => {
        console.error('Error submitting login form:', error);
        alert('An error occurred while logging in. Please try again later.');
    });
}

// Attacher l'événement au bouton de connexion si la page est chargée
document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.querySelector('.input-submit-login');
    if (loginButton) {
        loginButton.addEventListener('click', handleLogin);
    }
});

// Fonction pour gérer l'inscription
function handleRegistration() {
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const passwordConfirmation = document.getElementById('regPasswordConfirmation').value;

    // Vérifier si les passwords ne sont pas identiques ou vides
    if (password !== passwordConfirmation || password === '') {
        alert('Password and Password Confirmation do not match or are empty.');
        return;
    }

    // Vérifier si l'email est valide
    if (!validateEmail(email)) {
        alert('Email is not valid.');
        return;
    }

    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, passwordConfirmation }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Afficher un message de validation
            alert(data.message);
            // Rediriger l'utilisateur vers la page de connexion
            window.location.href = '/login';
        } else {
            // Afficher un message d'erreur
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error during registration:', error);
        alert('An error occurred. Please try again later.');
    });
}

// Fonction pour valider un email
function validateEmail(email) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
}

// Attacher l'événement au bouton d'inscription
document.addEventListener('DOMContentLoaded', () => {
    const registerButton = document.querySelector('.input-submit-register');
    if (registerButton) {
        registerButton.addEventListener('click', handleRegistration);
    }
});

// Fonction pour basculer entre les formulaires de connexion et d'inscription
function switchTo(section) {
    const x = document.getElementById('login');
    const y = document.getElementById('register');
    const z = document.getElementById('btn');

    if (section === 'login') {
        x.style.left = "27px";
        y.style.right = "-350px";
        z.style.left = "0px";
        document.querySelector('.switch').classList.remove('register-active');
        document.querySelector('.switch').classList.add('login-active');
        document.getElementById('login-text').style.display = 'none';
        document.getElementById('register-text').style.display = 'block';
    } else if (section === 'register') {
        x.style.left = "-350px";
        y.style.right = "25px";
        z.style.left = "150px";
        document.querySelector('.switch').classList.remove('login-active');
        document.querySelector('.switch').classList.add('register-active');
        document.getElementById('login-text').style.display = 'block';
        document.getElementById('register-text').style.display = 'none';
    }
}

   // View Password codes
   function myLogPassword(){
    var a = document.getElementById("logPassword");
    var b = document.getElementById("eye");
    var c = document.getElementById("eye-slash");
    if(a.type === "password"){
       a.type = "text";
       b.style.opacity = "0";
       c.style.opacity = "1";
    }else{
       a.type = "password";
       b.style.opacity = "1";
       c.style.opacity = "0";
    }
   }
   function myRegPassword(){

    var d = document.getElementById("regPassword");
    var b = document.getElementById("eye-2");
    var c = document.getElementById("eye-slash-2");

    if(d.type === "password"){
       d.type = "text";
       b.style.opacity = "0";
       c.style.opacity = "1";
    }else{
       d.type = "password";
       b.style.opacity = "1";
       c.style.opacity = "0";
    }
   }
   function myRegPasswordConfirmation(){

      var d = document.getElementById("regPasswordConfirmation");
      var b = document.getElementById("eye-3");
      var c = document.getElementById("eye-slash-3");
  
      if(d.type === "password"){
         d.type = "text";
         b.style.opacity = "0";
         c.style.opacity = "1";
      }else{
         d.type = "password";
         b.style.opacity = "1";
         c.style.opacity = "0";
      }
     }