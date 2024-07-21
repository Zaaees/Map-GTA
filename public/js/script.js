document.addEventListener('DOMContentLoaded', function () {
    const logos = document.querySelectorAll('.logo');
    const logoContainers = document.querySelectorAll('.logo-container');
    let isAdminMode = false;

    console.log('DOM loaded, found', logoContainers.length, 'logo containers');

    // Fonction pour charger les logos
    function updateLogoTitles(savedLogos) {
        Object.entries(savedLogos).forEach(([id, data]) => {
            const logoElement = document.getElementById(id);
            if (logoElement && data.name) {
                logoElement.setAttribute('title', data.name);
            }
        });
    }
    
    function loadLogos() {
        fetch('/get-logos')
            .then(response => response.json())
            .then(savedLogos => {
                console.log('Loaded saved logos:', savedLogos);
                Object.entries(savedLogos).forEach(([id, data]) => {
                    const container = document.querySelector(`#container-${id}`);
                    if (container) {
                        container.style.left = data.left;
                        container.style.top = data.top;
                        if (data.width) container.style.width = data.width;
                        if (data.height) container.style.height = data.height;
                        if (data.name) {
                            container.setAttribute('title', data.name);
                            // Ajoutez également le nom au logo lui-même
                            const logo = container.querySelector('.logo');
                            if (logo) {
                                logo.setAttribute('title', data.name);
                            }
                        }
                        
                        const dotElement = container.querySelector('.status-dot');
                        if (dotElement) {
                            dotElement.style.backgroundColor = data.color || 'transparent';
                        }
                    }
                });
            })
            .catch(error => console.error('Error loading logos:', error));
    }
    
    // Appeler loadLogos au chargement de la page
    document.addEventListener('DOMContentLoaded', loadLogos);

    // Charger les logos initialement
    loadLogos();

    // Fonction pour activer/désactiver le mode admin
    function toggleAdminMode(enabled) {
        isAdminMode = enabled;
        logoContainers.forEach(container => {
            // Permettre toujours les interactions pour le survol
            container.style.pointerEvents = 'auto';
            
            // Afficher/cacher les poignées de redimensionnement
            container.querySelectorAll('.resize-handle').forEach(handle => {
                handle.style.display = enabled ? 'block' : 'none';
            });
            
            // Activer/désactiver le déplacement
            container.draggable = enabled;
        });
        
        logos.forEach(logo => {
            logo.addEventListener('click', function () {
                if (!isAdminMode) return; // Sortir si pas en mode admin
                console.log('Logo clicked:', this.id);
                const dotElement = document.getElementById('dot-' + this.id);
                if (dotElement) {
                    console.log('Dot element found:', dotElement);
                    const newColor = changeFilterColor(dotElement);
                    console.log('New color:', newColor);
                    updateLogoColor(this.id, newColor);
                } else {
                    console.error('Dot element not found for logo:', this.id);
                }
            });
        });
    }

    // Initialiser en mode visiteur
    toggleAdminMode(false);


    
    // Gestion du bouton de connexion admin
    const adminLoginButton = document.getElementById('admin-login-button');
    const loginModal = document.getElementById('login-modal');
    const adminLoginForm = document.getElementById('admin-login-form');

    adminLoginButton.addEventListener('click', () => {
        loginModal.style.display = 'block';
    });

    adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        fetch('/admin-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                isAdminMode = true;
                toggleAdminMode(true);
                loginModal.style.display = 'none';
                alert('Mode administrateur activé');
            } else {
                alert('Identifiants incorrects');
            }
        })
        .catch(error => {
            console.error('Erreur lors de la connexion:', error);
            alert('Erreur lors de la connexion');
        });
    });

    // Charger les positions sauvegardées
    fetch('/get-logos')
        .then(response => response.json())
        .then(savedLogos => {
            console.log('Loaded saved logos:', savedLogos);
            Object.entries(savedLogos).forEach(([id, data]) => {
                const container = document.querySelector(`.logo-container:has(#${id.replace('filter-', '')})`);
                if (container) {
                    container.style.left = data.left;
                    container.style.top = data.top;
                    if (data.width) {
                        container.style.width = data.width;
                    }
                    if (data.height) {
                        container.style.height = data.height;
                    }
                    console.log('Updated position and size for', id, 'to', data.left, data.top, data.width, data.height);
                    updateLogoNames(savedLogos);

                    // Mise à jour de la taille de la pastille
                    const dot = container.querySelector('.status-dot');
                    dot.style.width = `${container.offsetWidth * 0.2}px`;
                    dot.style.height = `${container.offsetWidth * 0.2}px`;
                } else {
                    console.log('Container not found for', id);
                }
                const dotElement = document.getElementById('dot-' + id.replace('filter-', ''));
                if (dotElement) {
                    dotElement.style.backgroundColor = data.color;
                }
            });
        })
        .catch(error => console.error('Error loading logos:', error));

    function changeFilterColor(dotElement) {
        const currentColor = dotElement.style.backgroundColor;
        let newColor;
        switch (currentColor) {
            case 'transparent':
            case '':
                newColor = 'rgb(0, 255, 0)'; // Vert
                break;
            case 'rgb(0, 255, 0)':
                newColor = 'rgb(255, 165, 0)'; // Orange
                break;
            case 'rgb(255, 165, 0)':
                newColor = 'rgb(0, 0, 0)'; // Noir
                break;
            case 'rgb(0, 0, 0)':
                newColor = 'rgb(255, 0, 0)'; // Rouge
                break;
            case 'rgb(255, 0, 0)':
                newColor = 'transparent'; // Revenir à transparent
                break;
            default:
                newColor = 'transparent';
        }
        dotElement.style.backgroundColor = newColor;
        return newColor;
    }

    function addResizeHandles(container) {
        const handles = ['nw', 'ne', 'sw', 'se'];
        handles.forEach(handleClass => {
            const handle = document.createElement('div');
            handle.className = `resize-handle ${handleClass}`;
            container.appendChild(handle);
        });
    }

    logoContainers.forEach(addResizeHandles);

    function initResize(e) {
        e.preventDefault();
        const container = this.parentElement;
        const startWidth = container.offsetWidth;
        const startHeight = container.offsetHeight;
        const startX = e.clientX;
        const startY = e.clientY;
        const handle = this;

        function resize(e) {
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            if (handle.classList.contains('se') || handle.classList.contains('ne')) {
                container.style.width = `${startWidth + deltaX}px`;
            }
            if (handle.classList.contains('sw') || handle.classList.contains('nw')) {
                container.style.width = `${startWidth - deltaX}px`;
                container.style.left = `${container.offsetLeft + deltaX}px`;
            }
            if (handle.classList.contains('se') || handle.classList.contains('sw')) {
                container.style.height = `${startHeight + deltaY}px`;
            }
            if (handle.classList.contains('ne') || handle.classList.contains('nw')) {
                container.style.height = `${startHeight - deltaY}px`;
                container.style.top = `${container.offsetTop + deltaY}px`;
            }

            // Mettre à jour la taille de la pastille
            const dot = container.querySelector('.status-dot');
            dot.style.width = `${container.offsetWidth * 0.2}px`;
            dot.style.height = `${container.offsetWidth * 0.2}px`;
        }

        function stopResize() {
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('mouseup', stopResize);
        }

        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
        updateDotAndHandleSize(container);
    }

    // Ajout des événements de redimensionnement
    document.querySelectorAll('.resize-handle').forEach(handle => {
        handle.addEventListener('mousedown', initResize);
    });

    // Ajouter l'événement de clic sur chaque logo pour changer la couleur du filtre
    logos.forEach(logo => {
        logo.addEventListener('click', function () {
            console.log('Logo clicked:', this.id);
            const dotElement = document.getElementById('dot-' + this.id);
            if (dotElement) {
                console.log('Dot element found:', dotElement);
                const newColor = changeFilterColor(dotElement);
                console.log('New color:', newColor);
                updateLogoColor(this.id, newColor);
            } else {
                console.error('Dot element not found for logo:', this.id);
            }
        });
    });

    // Ajouter des événements pour le glisser-déposer des logos
    logoContainers.forEach(container => {
        container.addEventListener('mousedown', function (e) {
            if (!isAdminMode) return; // Sortir si pas en mode admin
            e.preventDefault();
            const container = this;
            const mapContainer = document.getElementById('map-container');
            const mapRect = mapContainer.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
    
            let shiftX = (e.clientX - containerRect.left) / mapRect.width * 100;
            let shiftY = (e.clientY - containerRect.top) / mapRect.height * 100;
    
            function moveAt(pageX, pageY) {
                const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
                const scrollY = window.pageYOffset || document.documentElement.scrollTop;
                const scale = mapContainer.offsetWidth / mapRect.width;
    
                let newLeft = ((pageX - mapRect.left - scrollX) / scale - shiftX * mapRect.width / 100) / mapRect.width * 100;
                let newTop = ((pageY - mapRect.top - scrollY) / scale - shiftY * mapRect.height / 100) / mapRect.height * 100;
    
                newLeft = Math.max(0, Math.min(newLeft, 100));
                newTop = Math.max(0, Math.min(newTop, 100));
    
                container.style.left = newLeft + '%';
                container.style.top = newTop + '%';
            }
    
            function onMouseMove(e) {
                moveAt(e.pageX, e.pageY);
            }
    
            document.addEventListener('mousemove', onMouseMove);
    
            document.addEventListener('mouseup', function() {
                document.removeEventListener('mousemove', onMouseMove);
                updateLogoPosition(
                    container.querySelector('.logo').id,
                    container.style.left,
                    container.style.top,
                    container.style.width,
                    container.style.height
                );
                container.classList.remove('dragging');
            }, { once: true });
    
            container.classList.add('dragging');
        });
    
        container.ondragstart = function () {
            return false;
        };
    });

    function updateLogoColor(id, color) {
        if (!isAdminMode) return;
        fetch('/update-logo-color', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: id, color: color })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Couleur mise à jour avec succès');
        })
        .catch(error => {
            console.error('Erreur lors de la mise à jour de la couleur:', error);
        });
    }

    function updateLogoPosition(id, left, top, width, height) {
        if (!isAdminMode) return;
        fetch('/update-logo-position', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: id, left, top, width, height })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Position mise à jour avec succès');
        })
        .catch(error => {
            console.error('Erreur lors de la mise à jour de la position:', error);
        });
    }

    function updateLogoName(id, name) {
        if (!isAdminMode) return;
        fetch('/update-logo-name', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id, name })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Nom mis à jour avec succès');
            const container = document.getElementById(`container-${id}`);
            if (container) {
                container.setAttribute('title', name);
            }
        })
        .catch(error => {
            console.error('Erreur lors de la mise à jour du nom:', error);
        });
    }

    function updateLogoNames(savedLogos) {
        Object.entries(savedLogos).forEach(([id, data]) => {
            const container = document.getElementById(`container-${id}`);
            if (container && data.name) {
                container.setAttribute('title', data.name);
            }
        });
    }
    function updateDotAndHandleSize(container) {
        const dot = container.querySelector('.status-dot');
        const handles = container.querySelectorAll('.resize-handle');
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;

        // Mise à jour de la taille de la pastille
        const dotSize = Math.min(Math.max(containerWidth * 0.3, 10), 30);
        dot.style.width = `${dotSize}px`;
        dot.style.height = `${dotSize}px`;

        // Mise à jour de la taille des carrés de redimensionnement
        const handleSize = Math.min(Math.max(containerWidth * 0.1, 5), 15);
        handles.forEach(handle => {
            handle.style.width = `${handleSize}px`;
            handle.style.height = `${handleSize}px`;
        });
    }
});    

function updateLogoName(id, name) {
    if (!isAdminMode) return;
    fetch('/update-logo-name', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, name })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Nom mis à jour avec succès');
        const container = document.getElementById(`container-${id}`);
        if (container) {
            container.setAttribute('title', name);
        }
    })
    .catch(error => {
        console.error('Erreur lors de la mise à jour du nom:', error);
    });
}
loadLogos();