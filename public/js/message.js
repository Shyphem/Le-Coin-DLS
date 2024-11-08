document.addEventListener("DOMContentLoaded", async function() {
    try {
        // R�cup�rer l'utilisateur connect� depuis le localStorage
        const utilisateurConnecte = JSON.parse(localStorage.getItem('utilisateurConnecte'));
        
        if (!utilisateurConnecte) {
            alert("Vous devez �tre connect� pour acc�der � vos messages.");
            window.location.href = 'connexion.html'; // Rediriger vers la page de connexion si non connect�
            return;
        }

        const email = utilisateurConnecte.email;

        // R�cup�rer l'ID de l'utilisateur connect�
        const responseUtilisateur = await fetch(`/api/utilisateur-id?email=${email}`);
        const dataUtilisateur = await responseUtilisateur.json();

        if (!dataUtilisateur.success) {
            console.error("Impossible de r�cup�rer l'ID de l'utilisateur.");
            return;
        }

        const utilisateurId = dataUtilisateur.id;

        // R�cup�rer toutes les conversations de l'utilisateur
        const responseConversations = await fetch(`/api/conversations?utilisateurId=${utilisateurId}`);
        const dataConversations = await responseConversations.json();

        if (dataConversations.success) {
            const conversationList = document.getElementById("conversation-list");

            dataConversations.conversations.forEach(conversation => {
                const convElement = document.createElement("div");
                convElement.classList.add("conversation");
                convElement.innerHTML = `
                    <p>Conversation avec ${conversation.utilisateur2}</p>
                    <a href="chat.html?conversationId=${conversation.id}">Voir la conversation</a>
                `;
                conversationList.appendChild(convElement);
            });
        } else {
            console.error("Erreur lors du chargement des conversations :", dataConversations.message);
        }

    } catch (error) {
        console.error("Erreur g�n�rale :", error);
    }
});
