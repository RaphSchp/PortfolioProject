// Fonction pour gérer la soumission du formulaire de connexion
function handleLogin() {
    const email = document.getElementById('logEmail').value;
    const password = document.getElementById('logPassword').value;

    console.log('Clic sur le bouton de connexion');

    // Envoi des données au serveur
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })
    .then(response => response.json())
    .then(data => {
        // Vérification de la réponse du serveur
        if (data.success) {
            // Redirection vers la page principale en cas de succès
            window.location.href = '/pages/mainpage.html';
        } else {
            // Affichage d'un message d'erreur en cas d'échec
            alert('Identifiant ou mot de passe incorrect.');
        }
    })
    .catch(error => {
        console.error('Erreur lors de la soumission du formulaire de connexion:', error);
    });
}

// Attacher l'événement au bouton de connexion si la page est chargée
document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.querySelector('.input-submit');
    if (loginButton) {
        loginButton.addEventListener('click', handleLogin);
    }
});

// DO NOT CHANGE THIS
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
// DO NOT CHANGE THIS