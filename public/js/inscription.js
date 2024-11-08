document.getElementById("signupForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

    const emailPattern = /^[a-z]+\.[a-z]+@lyceedelasalle\.fr$/;  // Le modèle pour xxx.x@lyceedelasalle.fr

    if (!emailPattern.test(email)) {
        alert("Veuillez entrer une adresse email valide du type xxx.x@lyceedelasalle.fr.");
        return;
    }

    if (password.length < 6) {
        alert("Le mot de passe doit contenir au moins 6 caractères.");
        return;
    }

    const passwordConfirm = document.getElementById("signup-password-confirm").value;
    if (password !== passwordConfirm) {
        alert("Les mots de passe ne correspondent pas.");
        return;
    }

    // Envoi de la requête à l'API d'inscription
    fetch('/api/inscription', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email, password: password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Inscription réussie !");
            window.location.href = "connexion.html";
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error("Erreur lors de l'inscription :", error);
    });
});
