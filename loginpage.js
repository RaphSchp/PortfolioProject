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